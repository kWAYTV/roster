//! Application data directory resolved through Tauri's PathResolver.

use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;

use tauri::{AppHandle, Manager};

static DIR: OnceLock<PathBuf> = OnceLock::new();

/// Capture `app.path().app_data_dir()` once at startup.
pub fn init(app: &AppHandle) -> Result<(), String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Failed to resolve the app data directory: {error}"))?;
    fs::create_dir_all(&dir).map_err(|_| "Failed to create the app data directory.".to_string())?;
    let _ = DIR.set(dir);
    Ok(())
}

/// Directory for Roster-owned JSON (preferences, metadata).
pub fn dir() -> PathBuf {
    DIR.get().cloned().unwrap_or_else(fallback_dir)
}

fn fallback_dir() -> PathBuf {
    // Pre-init / unit tests: same layout Tauri uses on Windows for `dev.roster.app`.
    let base = std::env::var("APPDATA").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(base).join("dev.roster.app")
}
