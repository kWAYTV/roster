use tauri::AppHandle;

use super::{after_account_change, find_account};

#[tauri::command]
pub fn sign_in(
    app: AppHandle,
    steamid: String,
    force_invisible: Option<bool>,
) -> Result<String, String> {
    let account = find_account(&steamid)?;
    after_account_change(
        &app,
        crate::login::sign_in(&account, force_invisible.unwrap_or(false)),
    )
}
