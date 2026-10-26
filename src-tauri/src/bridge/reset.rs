use tauri::AppHandle;

use super::{after_account_change, run_blocking};

#[tauri::command]
pub async fn clear_cache(app: AppHandle) -> Result<String, String> {
    run_blocking(move || after_account_change(&app, crate::reset::clear())).await
}
