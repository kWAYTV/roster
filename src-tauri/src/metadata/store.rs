use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use super::record::AccountMetadata;

const FILE: &str = "metadata.json";

type Store = HashMap<String, AccountMetadata>;

/// Every account's metadata, keyed by SteamID.
pub fn all() -> Store {
    match fs::read_to_string(path()) {
        Ok(raw) => serde_json::from_str(&raw).unwrap_or_else(|_| {
            // Keep the corrupt file around instead of silently wiping
            // cooldowns and last-used times on the next save.
            let _ = fs::rename(path(), path().with_extension("json.corrupt"));
            Store::new()
        }),
        Err(_) => Store::new(),
    }
}

/// Pretty-printed JSON of the full metadata store (for backup).
pub fn export_json() -> Result<String, String> {
    serde_json::to_string_pretty(&all()).map_err(|_| "Failed to encode metadata.".to_string())
}

/// Replace the store with parsed backup JSON.
pub fn import_json(raw: &str) -> Result<usize, String> {
    let store: Store =
        serde_json::from_str(raw.trim()).map_err(|_| "Invalid metadata backup.".to_string())?;
    let count = store.len();
    save(&store)?;
    Ok(count)
}

/// Record that an account was just signed in to (best effort).
pub fn mark_used(steamid: &str) {
    let _ = update(steamid, |record| record.last_used = now());
}

/// Start a cooldown of `duration_seconds` from now.
pub fn set_cooldown(steamid: &str, duration_seconds: u64) -> Result<(), String> {
    update(steamid, |record| {
        record.cooldown_until = now() + duration_seconds;
        record.cooldown_duration = duration_seconds;
    })
}

/// End any active cooldown for an account.
pub fn clear_cooldown(steamid: &str) -> Result<(), String> {
    update(steamid, |record| {
        record.cooldown_until = 0;
        record.cooldown_duration = 0;
    })
}

/// Pin or unpin an account.
pub fn set_pinned(steamid: &str, pinned: bool) -> Result<(), String> {
    update(steamid, |record| record.pinned = pinned)
}

/// Replace the freeform note (empty clears it).
pub fn set_note(steamid: &str, note: String) -> Result<(), String> {
    update(steamid, |record| record.note = note.trim().to_string())
}

/// Patch optional per-account sign-in overrides. `None` fields are left alone;
/// pass `Some(None)` via dedicated clear helpers when needed.
pub fn set_overrides(
    steamid: &str,
    always_invisible: Option<Option<bool>>,
    mute_notifications: Option<Option<bool>>,
    launch_cs2: Option<Option<bool>>,
    cs2_launch_options: Option<Option<String>>,
) -> Result<(), String> {
    update(steamid, |record| {
        if let Some(value) = always_invisible {
            record.always_invisible = value;
        }
        if let Some(value) = mute_notifications {
            record.mute_notifications = value;
        }
        if let Some(value) = launch_cs2 {
            record.launch_cs2 = value;
        }
        if let Some(value) = cs2_launch_options {
            record.cs2_launch_options = value.map(|text| text.trim().to_string());
        }
    })
}

/// Drop all metadata for an account (used when it is removed).
pub fn forget(steamid: &str) {
    let mut store = all();
    if store.remove(steamid).is_some() {
        let _ = save(&store);
    }
}

/// Load the store, mutate one record, and persist the result.
fn update(steamid: &str, mutate: impl FnOnce(&mut AccountMetadata)) -> Result<(), String> {
    let mut store = all();
    let record = store.entry(steamid.to_string()).or_default();
    mutate(record);
    if record.is_empty() {
        store.remove(steamid);
    }
    save(&store)
}

fn save(store: &Store) -> Result<(), String> {
    let path = path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|_| "Failed to create the metadata directory.")?;
    }
    let json = serde_json::to_string_pretty(store)
        .map_err(|_| "Failed to encode metadata.".to_string())?;
    fs::write(&path, json).map_err(|_| "Failed to write metadata.".to_string())
}

fn path() -> PathBuf {
    crate::app_data::dir().join(FILE)
}

fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}
