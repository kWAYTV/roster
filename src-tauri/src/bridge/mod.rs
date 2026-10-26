//! The Tauri command boundary: thin adapters from the UI into the domains.

pub mod cooldown;
mod dto;
pub mod export;
pub mod intake;
pub mod login;
pub mod logs;
pub mod metadata;
pub mod preferences;
pub mod reset;
pub mod roster;
pub mod status;
pub mod tokens;
pub mod util;

use tauri::{AppHandle, Emitter};

/// After a change to accounts, refresh the tray menu and notify the window.
pub(crate) fn after_account_change(
    app: &AppHandle,
    result: Result<String, String>,
) -> Result<String, String> {
    match &result {
        Ok(message) => crate::log::append(message.to_string()),
        Err(error) => crate::log::append(format!("Error: {error}")),
    }
    // Refresh the roster on token failures too — so JWT expired badges update.
    if result.is_ok() || is_token_roster_error(&result) {
        let _ = crate::tray::rebuild(app);
        let _ = app.emit("accounts-changed", ());
    }
    result
}

fn is_token_roster_error(result: &Result<String, String>) -> bool {
    let Err(error) = result else {
        return false;
    };
    let lower = error.to_ascii_lowercase();
    lower.contains("expired") || lower.contains("no saved login token")
}

/// Run Steam/file work off the IPC thread so the window stays responsive.
pub(crate) async fn run_blocking<T, F>(work: F) -> Result<T, String>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T, String> + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(work)
        .await
        .map_err(|error| format!("Background task failed: {error}"))?
}

/// Resolve a stored account by SteamID for command handlers.
pub(crate) fn find_account(steamid: &str) -> Result<crate::roster::Account, String> {
    crate::roster::list()?
        .into_iter()
        .find(|account| account.steamid == steamid)
        .ok_or_else(|| "Account unavailable".to_string())
}
