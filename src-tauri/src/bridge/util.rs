use std::path::PathBuf;

use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
pub fn write_clipboard(text: String) -> Result<(), String> {
    crate::intake::write_clipboard(&text)
}

#[tauri::command]
pub fn write_text_file(path: String, contents: String) -> Result<(), String> {
    let path = PathBuf::from(path);
    if path.as_os_str().is_empty() {
        return Err("No file path.".to_string());
    }
    std::fs::write(&path, contents).map_err(|error| format!("Could not write file: {error}"))
}

#[tauri::command]
pub fn read_text_file(path: String) -> Result<String, String> {
    if path.trim().is_empty() {
        return Err("No file path.".to_string());
    }
    std::fs::read_to_string(path).map_err(|error| format!("Could not read file: {error}"))
}

#[tauri::command]
pub fn is_steam_running() -> bool {
    crate::steam_client::is_running()
}

#[tauri::command]
pub fn open_steam_profile(app: AppHandle, steamid: String) -> Result<(), String> {
    if steamid.len() < 15 || !steamid.chars().all(|c| c.is_ascii_digit()) {
        return Err("Invalid SteamID.".to_string());
    }
    let url = format!("https://steamcommunity.com/profiles/{steamid}");
    open_https(&app, &url)
}

#[tauri::command]
pub fn open_external_url(app: AppHandle, url: String) -> Result<(), String> {
    if !url.starts_with("https://") {
        return Err("Only https links are supported.".to_string());
    }
    open_https(&app, &url)
}

fn open_https(app: &AppHandle, url: &str) -> Result<(), String> {
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|_| "Failed to open the link.".to_string())
}
