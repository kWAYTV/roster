use std::thread::sleep;
use std::time::Duration;

use base64::engine::general_purpose::STANDARD;
use base64::Engine;

use super::profile::{self, ProfileStatus};

/// Pause between requests so a large roster stays under Steam's rate limits.
const THROTTLE: Duration = Duration::from_millis(400);
const TIMEOUT: Duration = Duration::from_secs(10);

pub struct FetchedProfile {
    pub status: ProfileStatus,
    pub avatar: Option<String>,
}

/// Fetch each account's profile in order, reporting results one at a time.
/// A failed fetch yields `None` so callers can keep whatever they had.
pub fn sweep(steamids: &[String], mut on_result: impl FnMut(&str, Option<FetchedProfile>)) {
    for (index, steamid) in steamids.iter().enumerate() {
        if index > 0 {
            sleep(THROTTLE);
        }
        on_result(steamid, fetch_one(steamid));
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
