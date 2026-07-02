use tauri::AppHandle;

use super::after_account_change;

#[tauri::command]
pub fn clear_cache(app: AppHandle) -> Result<String, String> {
    after_account_change(&app, crate::reset::clear())
}
