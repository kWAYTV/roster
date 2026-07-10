use tauri::AppHandle;

use super::dto::AccountView;
use super::{after_account_change, find_account};

#[tauri::command]
pub fn list_accounts() -> Result<Vec<AccountView>, String> {
    Ok(crate::roster::list()?
        .iter()
        .map(AccountView::from)
        .collect())
}

#[tauri::command]
pub fn remove_account(app: AppHandle, steamid: String) -> Result<String, String> {
    let account = find_account(&steamid)?;
    after_account_change(&app, crate::forget::remove(&account))
}

#[tauri::command]
pub fn remove_accounts(app: AppHandle, steamids: Vec<String>) -> Result<String, String> {
    let mut accounts = Vec::with_capacity(steamids.len());
    for steamid in steamids {
        accounts.push(find_account(&steamid)?);
    }
    after_account_change(&app, crate::forget::remove_many(&accounts))
}
