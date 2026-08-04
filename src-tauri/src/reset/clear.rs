use std::fs;

use crate::steam_client::{cache_dir, install_dir, stop};

/// Remove the config files and cache directory that hold Steam logins,
/// plus Roster's per-account metadata so pins/notes/cooldowns do not orphan.
pub fn clear() -> Result<String, String> {
    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    let config_dir = install.join("config");
    let cache = cache_dir()?;

    stop()?;

    remove_file_if_present(&config_dir.join("config.vdf"), "config.vdf")?;
    remove_file_if_present(&config_dir.join("loginusers.vdf"), "loginusers.vdf")?;

    if cache.exists() {
        fs::remove_dir_all(&cache).map_err(|e| format!("Failed to clear the Steam cache: {e}"))?;
    }

    crate::metadata::clear_all()?;

    Ok("Login data cleared".to_string())
}

fn remove_file_if_present(path: &std::path::Path, label: &str) -> Result<(), String> {
    if path.exists() {
        fs::remove_file(path).map_err(|e| format!("Failed to delete {label}: {e}"))?;
    }
    Ok(())
}
