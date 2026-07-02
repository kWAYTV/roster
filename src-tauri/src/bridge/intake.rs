use tauri::AppHandle;

use super::after_account_change;

#[tauri::command]
pub fn read_clipboard() -> Result<String, String> {
    crate::intake::read_clipboard()
}

#[tauri::command]
pub fn import_accounts(app: AppHandle, payload: String) -> Result<String, String> {
    after_account_change(&app, crate::intake::import_text(&payload))
}
