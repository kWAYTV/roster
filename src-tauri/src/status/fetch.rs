use std::thread::sleep;
use std::time::Duration;

use super::profile::{self, ProfileStatus};

/// Pause between requests so a large roster stays under Steam's rate limits.
const THROTTLE: Duration = Duration::from_millis(400);
const TIMEOUT: Duration = Duration::from_secs(10);

/// Fetch each account's status in order, reporting results one at a time.
/// A failed fetch yields `None` so callers can keep whatever they had.
pub fn sweep(steamids: &[String], mut on_result: impl FnMut(&str, Option<ProfileStatus>)) {
    for (index, steamid) in steamids.iter().enumerate() {
        if index > 0 {
            sleep(THROTTLE);
        }
        on_result(steamid, fetch_one(steamid));
    }
}

fn fetch_one(steamid: &str) -> Option<ProfileStatus> {
    let url = format!("https://steamcommunity.com/profiles/{steamid}/?xml=1");
    let body = ureq::get(&url)
        .config()
        .timeout_global(Some(TIMEOUT))
        .build()
        .header("User-Agent", "Mozilla/5.0")
        .header("Cache-Control", "no-cache")
        .call()
        .ok()?
        .body_mut()
        .read_to_string()
        .ok()?;
    Some(profile::parse(&body))
}
