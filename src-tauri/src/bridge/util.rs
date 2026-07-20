use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
pub fn write_clipboard(text: String) -> Result<(), String> {
    crate::intake::write_clipboard(&text)
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
