use std::os::windows::process::CommandExt;
use std::process::Command;

const CREATE_NO_WINDOW: u32 = 0x0800_0000;

fn open_url(url: &str) -> Result<(), String> {
    Command::new("cmd")
        .args(["/C", "start", "", url])
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map_err(|_| "Failed to open the link.".to_string())?;
    Ok(())
}

#[tauri::command]
pub fn write_clipboard(text: String) -> Result<(), String> {
    crate::intake::write_clipboard(&text)
}

#[tauri::command]
pub fn open_steam_profile(steamid: String) -> Result<(), String> {
    if steamid.len() < 15 || !steamid.chars().all(|c| c.is_ascii_digit()) {
        return Err("Invalid SteamID.".to_string());
    }
    let url = format!("https://steamcommunity.com/profiles/{steamid}");
    open_url(&url)
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    if !url.starts_with("https://") {
        return Err("Only https links are supported.".to_string());
    }
    open_url(&url)
}
