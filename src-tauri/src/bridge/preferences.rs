use tauri::{AppHandle, Emitter};

use crate::preferences::Preferences;

#[tauri::command]
pub fn get_preferences() -> Preferences {
    crate::preferences::load()
}

#[tauri::command]
pub fn save_preferences(app: AppHandle, preferences: Preferences) -> Result<(), String> {
    crate::preferences::save(&preferences)?;
    crate::window::apply_capture(&app, preferences.hide_from_capture);
    let _ = crate::tray::rebuild(&app);
    let _ = app.emit("preferences-changed", ());
    Ok(())
}
