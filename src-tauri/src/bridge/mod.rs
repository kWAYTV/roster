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
    if result.is_ok() {
        let _ = crate::tray::rebuild(app);
        let _ = app.emit("accounts-changed", ());
    }
    result
}

/// Resolve a stored account by SteamID for command handlers.
pub(crate) fn find_account(steamid: &str) -> Result<crate::roster::Account, String> {
    crate::roster::list()?
        .into_iter()
        .find(|account| account.steamid == steamid)
        .ok_or_else(|| "Account unavailable".to_string())
}
