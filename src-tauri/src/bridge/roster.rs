use tauri::AppHandle;

use super::dto::AccountView;
use super::{after_account_change, find_account};

#[tauri::command]
pub fn list_accounts(app: AppHandle) -> Result<Vec<AccountView>, String> {
    let (accounts, filled) = crate::roster::list_for_ui()?;
    if filled {
        let _ = crate::tray::rebuild(&app);
    }
    let autologin = crate::steam_client::autologin_user();
    Ok(accounts
        .iter()
        .map(|account| AccountView::from_account(account, autologin.as_deref()))
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
