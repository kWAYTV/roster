use std::sync::{mpsc, Arc, Mutex};
use std::thread;
use std::time::Duration;

use base64::engine::general_purpose::STANDARD;
use base64::Engine;

use super::profile::{self, ProfileStatus};

/// Concurrent workers with light spacing so large rosters finish faster
/// without slamming Steam Community.
const WORKERS: usize = 4;
const THROTTLE: Duration = Duration::from_millis(120);
const TIMEOUT: Duration = Duration::from_secs(10);

pub struct FetchedProfile {
    pub status: ProfileStatus,
    pub avatar: Option<String>,
}

/// Fetch each account's profile, reporting results as they arrive.
/// A failed fetch yields `None` so callers can keep whatever they had.
pub fn sweep(steamids: &[String], on_result: impl FnMut(&str, Option<FetchedProfile>) + Send) {
    if steamids.is_empty() {
        return;
    }

    let (tx, rx) = mpsc::channel::<(String, Option<FetchedProfile>)>();
    let queue = Arc::new(Mutex::new(steamids.to_vec()));
    let worker_count = WORKERS.min(steamids.len()).max(1);

    for _ in 0..worker_count {
        let queue = Arc::clone(&queue);
        let tx = tx.clone();
        thread::spawn(move || loop {
            let steamid = {
                let mut guard = queue
                    .lock()
                    .unwrap_or_else(|poisoned| poisoned.into_inner());
                if guard.is_empty() {
                    break;
                }
                guard.remove(0)
            };
            let fetched = fetch_one(&steamid);
            if tx.send((steamid, fetched)).is_err() {
                break;
            }
            thread::sleep(THROTTLE);
        });
    }
    drop(tx);

    let mut on_result = on_result;
    while let Ok((steamid, fetched)) = rx.recv() {
        on_result(&steamid, fetched);
    }
}

fn fetch_one(steamid: &str) -> Option<FetchedProfile> {
    let body = fetch_xml(steamid)?;
    let status = profile::parse(&body);
    let avatar = if status.avatar_url.is_empty() {
        None
    } else {
        download_avatar_data_url(&status.avatar_url)
    };
    Some(FetchedProfile { status, avatar })
}

fn fetch_xml(steamid: &str) -> Option<String> {
    let url = format!("https://steamcommunity.com/profiles/{steamid}/?xml=1");
    ureq::get(&url)
        .config()
        .timeout_global(Some(TIMEOUT))
        .build()
        .header("User-Agent", "Mozilla/5.0")
        .header("Cache-Control", "no-cache")
        .call()
        .ok()?
        .body_mut()
        .read_to_string()
        .ok()
}

fn download_avatar_data_url(url: &str) -> Option<String> {
    let bytes = ureq::get(url)
        .config()
        .timeout_global(Some(TIMEOUT))
        .build()
        .header("User-Agent", "Mozilla/5.0")
        .call()
        .ok()?
        .body_mut()
        .read_to_vec()
        .ok()?;
    if bytes.is_empty() {
        return None;
    }
    let mime = if url.contains(".jpg") || url.contains(".jpeg") {
        "image/jpeg"
    } else {
        "image/png"
    };
    Some(format!("data:{mime};base64,{}", STANDARD.encode(bytes)))
}
