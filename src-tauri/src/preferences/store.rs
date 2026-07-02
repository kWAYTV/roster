use std::fs;
use std::path::PathBuf;

use super::model::Preferences;

const APP_DIR: &str = "dev.roster.app";
const FILE: &str = "preferences.json";

/// Load preferences, falling back to defaults on any read or parse failure.
pub fn load() -> Preferences {
    match fs::read_to_string(path()) {
        Ok(raw) => serde_json::from_str(&raw).unwrap_or_else(|_| {
            // Keep the corrupt file around instead of silently overwriting
            // it with defaults on the next save.
            let _ = fs::rename(path(), path().with_extension("json.corrupt"));
            Preferences::default()
        }),
        Err(_) => Preferences::default(),
    }
}

/// Write preferences as pretty JSON, creating the app directory if needed.
pub fn save(preferences: &Preferences) -> Result<(), String> {
    let path = path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|_| "Failed to create the settings directory.")?;
    }
    let json = serde_json::to_string_pretty(preferences)
        .map_err(|_| "Failed to encode preferences.".to_string())?;
    fs::write(&path, json).map_err(|_| "Failed to write preferences.".to_string())
}

fn path() -> PathBuf {
    let base = std::env::var("APPDATA").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(base).join(APP_DIR).join(FILE)
}
