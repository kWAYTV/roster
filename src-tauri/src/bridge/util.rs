use std::os::windows::process::CommandExt;
use std::process::Command;

const CREATE_NO_WINDOW: u32 = 0x0800_0000;

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
    Command::new("cmd")
        .args(["/C", "start", "", &url])
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map_err(|_| "Failed to open the Steam profile.".to_string())?;
    Ok(())
}
