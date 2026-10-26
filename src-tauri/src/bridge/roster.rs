use tauri::{AppHandle, Emitter};

use super::dto::AccountView;
use super::{after_account_change, find_account, run_blocking};

#[tauri::command]
pub fn list_accounts(app: AppHandle) -> Result<Vec<AccountView>, String> {
    let accounts = crate::roster::list()?;
    schedule_persona_fill(app);
    let autologin = crate::steam_client::autologin_user();
    Ok(accounts
        .iter()
        .map(|account| AccountView::from_account(account, autologin.as_deref()))
        .collect())
}

/// Resolve missing community names off the IPC thread, then refresh the UI once.
fn schedule_persona_fill(app: AppHandle) {
    use crate::steam_config::loginusers::is_display_label;

    let needs_fill = crate::roster::list_tray().ok().is_some_and(|accounts| {
        accounts.iter().any(|account| {
            !is_display_label(&account.persona_name) && !is_display_label(&account.account_name)
        })
    });
    if !needs_fill {
        return;
    }

    std::thread::spawn(move || {
        match crate::roster::fill_missing_personas() {
            Ok(true) => {
                let _ = crate::tray::rebuild(&app);
                let _ = app.emit("accounts-changed", ());
            }
            Ok(false) => {}
            Err(error) => crate::log::append(format!("Error: persona fill failed: {error}")),
        }
    });
}

#[tauri::command]
pub async fn remove_account(app: AppHandle, steamid: String) -> Result<String, String> {
    run_blocking(move || {
        let account = find_account(&steamid)?;
        after_account_change(&app, crate::forget::remove(&account))
    })
    .await
}

#[tauri::command]
pub async fn remove_accounts(app: AppHandle, steamids: Vec<String>) -> Result<String, String> {
    run_blocking(move || {
        let mut accounts = Vec::with_capacity(steamids.len());
        for steamid in steamids {
            accounts.push(find_account(&steamid)?);
        }
        after_account_change(&app, crate::forget::remove_many(&accounts))
    })
    .await
}
