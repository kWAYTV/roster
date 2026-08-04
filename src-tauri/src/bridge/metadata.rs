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

#[tauri::command]
pub fn set_tags(app: AppHandle, steamid: String, tags: Vec<String>) -> Result<String, String> {
    crate::metadata::set_tags(&steamid, tags)?;
    after_account_change(&app, Ok("Tags saved".to_string()))
}

#[tauri::command]
pub fn set_pinned_many(
    app: AppHandle,
    steamids: Vec<String>,
    pinned: bool,
) -> Result<String, String> {
    for steamid in &steamids {
        crate::metadata::set_pinned(steamid, pinned)?;
    }
    let count = steamids.len();
    after_account_change(
        &app,
        Ok(if pinned {
            format!("Pinned {count}")
        } else {
            format!("Unpinned {count}")
        }),
    )
}

#[tauri::command]
pub fn clear_notes_many(app: AppHandle, steamids: Vec<String>) -> Result<String, String> {
    for steamid in &steamids {
        crate::metadata::set_note(steamid, String::new())?;
    }
    after_account_change(
        &app,
        Ok(format!(
            "Cleared notes on {}",
            steamids.len()
        )),
    )
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
