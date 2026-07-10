use serde::Serialize;
use tauri::AppHandle;

use super::after_account_change;

#[derive(Serialize)]
pub struct ClassifyResult {
    pub importable: Vec<String>,
    pub expired: Vec<String>,
}

#[tauri::command]
pub fn read_clipboard() -> Result<String, String> {
    crate::intake::read_clipboard()
}

#[tauri::command]
pub fn classify_import(payload: String) -> ClassifyResult {
    let (importable, expired) = crate::intake::classify(&payload);
    ClassifyResult {
        importable,
        expired,
    }
}

#[tauri::command]
pub fn import_accounts(app: AppHandle, payload: String) -> Result<String, String> {
    after_account_change(&app, crate::intake::import_text(&payload))
}
