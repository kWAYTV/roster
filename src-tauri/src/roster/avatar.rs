use std::fs;
use std::path::{Path, PathBuf};

use super::account::Account;
use crate::steam_client::steamid3_from_steamid64;

/// Best-effort avatar image path for an account, checking the avatar cache
/// first and then the per-user config directory.
pub fn resolve(install: &Path, account: &Account) -> Option<PathBuf> {
    from_cache(install, account).or_else(|| from_userdata(install, account))
}

fn from_cache(install: &Path, account: &Account) -> Option<PathBuf> {
    let dir = install.join("config").join("avatarcache");
    if !dir.exists() {
        return None;
    }

    if let Some(hash) = account.avatar_hash.as_deref() {
        for name in [
            hash.to_string(),
            format!("{hash}.png"),
            format!("{hash}.jpg"),
        ] {
            let candidate = dir.join(name);
            if candidate.exists() {
                return Some(candidate);
            }
        }
    }

    for name in [
        format!("{}.png", account.steamid),
        format!("{}.jpg", account.steamid),
        account.steamid.clone(),
    ] {
        let candidate = dir.join(name);
        if candidate.exists() {
            return Some(candidate);
        }
    }

    scan_for_match(&dir, account)
}

/// Fall back to a directory scan when exact names miss (extension quirks).
fn scan_for_match(dir: &Path, account: &Account) -> Option<PathBuf> {
    let hash = account.avatar_hash.as_deref().map(str::to_lowercase);
    for entry in fs::read_dir(dir).ok()?.flatten() {
        let path = entry.path();
        let name = path.file_name()?.to_string_lossy().to_lowercase();
        let matches_hash = hash.as_ref().is_some_and(|h| name.contains(h.as_str()));
        if matches_hash || name.contains(&account.steamid) {
            return Some(path);
        }
    }
    None
}

fn from_userdata(install: &Path, account: &Account) -> Option<PathBuf> {
    let steamid3 = steamid3_from_steamid64(&account.steamid).ok()?;
    let userdata = install.join("userdata").join(steamid3);
    [
        userdata.join("config").join("avatar.png"),
        userdata.join("config").join("avatar.jpg"),
        userdata.join("avatar.png"),
    ]
    .into_iter()
    .find(|candidate| candidate.exists())
}
