use tauri::{AppHandle, Emitter};

#[tauri::command]
pub fn set_cooldown(app: AppHandle, steamid: String, seconds: u64) -> Result<(), String> {
    crate::metadata::set_cooldown(&steamid, seconds)?;
    let _ = app.emit("accounts-changed", ());
    Ok(())
}

#[tauri::command]
pub fn clear_cooldown(app: AppHandle, steamid: String) -> Result<(), String> {
    crate::metadata::clear_cooldown(&steamid)?;
    let _ = app.emit("accounts-changed", ());
    Ok(())
}

#[tauri::command]
pub fn set_cooldown_many(
    app: AppHandle,
    steamids: Vec<String>,
    seconds: u64,
) -> Result<(), String> {
    for steamid in steamids {
        crate::metadata::set_cooldown(&steamid, seconds)?;
    }
    let _ = app.emit("accounts-changed", ());
    Ok(())
}

#[tauri::command]
pub fn clear_cooldown_many(app: AppHandle, steamids: Vec<String>) -> Result<(), String> {
    for steamid in steamids {
        crate::metadata::clear_cooldown(&steamid)?;
    }
    let _ = app.emit("accounts-changed", ());
    Ok(())
}
