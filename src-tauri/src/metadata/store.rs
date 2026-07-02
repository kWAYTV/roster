use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use super::record::AccountMetadata;

const APP_DIR: &str = "dev.roster.app";
const FILE: &str = "metadata.json";

type Store = HashMap<String, AccountMetadata>;

/// Every account's metadata, keyed by SteamID.
pub fn all() -> Store {
    match fs::read_to_string(path()) {
        Ok(raw) => serde_json::from_str(&raw).unwrap_or_default(),
        Err(_) => Store::new(),
    }
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
    let base = std::env::var("APPDATA").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(base).join(APP_DIR).join(FILE)
}

fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}
