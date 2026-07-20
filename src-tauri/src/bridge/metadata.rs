use tauri::AppHandle;

use super::after_account_change;

#[tauri::command]
pub fn set_pinned(app: AppHandle, steamid: String, pinned: bool) -> Result<String, String> {
    crate::metadata::set_pinned(&steamid, pinned)?;
    after_account_change(
        &app,
        Ok(if pinned {
            "Pinned".to_string()
        } else {
            "Unpinned".to_string()
        }),
    )
}

#[tauri::command]
pub fn set_note(app: AppHandle, steamid: String, note: String) -> Result<String, String> {
    crate::metadata::set_note(&steamid, note)?;
    after_account_change(&app, Ok("Note saved".to_string()))
}

/// Full replacement of per-account sign-in overrides (`null` = inherit global).
#[derive(serde::Deserialize)]
pub struct OverridePatch {
    pub always_invisible: Option<bool>,
    pub mute_notifications: Option<bool>,
    pub launch_cs2: Option<bool>,
    pub cs2_launch_options: Option<String>,
}

#[tauri::command]
pub fn set_account_overrides(
    app: AppHandle,
    steamid: String,
    patch: OverridePatch,
) -> Result<String, String> {
    crate::metadata::set_overrides(
        &steamid,
        Some(patch.always_invisible),
        Some(patch.mute_notifications),
        Some(patch.launch_cs2),
        Some(patch.cs2_launch_options),
    )?;
    after_account_change(&app, Ok("Overrides saved".to_string()))
}

#[tauri::command]
pub fn export_metadata() -> Result<String, String> {
    crate::metadata::export_json()
}

#[tauri::command]
pub fn import_metadata(app: AppHandle, payload: String) -> Result<String, String> {
    let count = crate::metadata::import_json(&payload)?;
    after_account_change(
        &app,
        Ok(format!(
            "Restored metadata for {count} account{}",
            if count == 1 { "" } else { "s" }
        )),
    )
}
