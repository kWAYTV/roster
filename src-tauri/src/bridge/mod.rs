//! The Tauri command boundary: thin adapters from the UI into the domains.

mod dto;
pub mod cooldown;
pub mod intake;
pub mod login;
pub mod preferences;
pub mod reset;
pub mod roster;

use tauri::{AppHandle, Emitter};

/// After a change to accounts, refresh the tray menu and notify the window.
pub(crate) fn after_account_change(
    app: &AppHandle,
    result: Result<String, String>,
) -> Result<String, String> {
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
        .ok_or_else(|| "That account is no longer available.".to_string())
}
