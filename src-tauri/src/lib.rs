//! Roster: a Windows Steam login switcher.
//!
//! Modules are organized by what the app does (`roster`, `intake`, `login`,
//! `forget`, `reset`, `preferences`, `presence`) with Steam and Windows
//! integration isolated behind capability boundaries (`vdf`, `steam_config`,
//! `steam_client`, `secret`). `bridge` and `tray` are the app's edges.

mod bridge;
mod forget;
mod intake;
mod login;
mod preferences;
mod presence;
mod reset;
mod roster;
mod secret;
mod steam_client;
mod steam_config;
mod tray;
mod vdf;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            tray::setup(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            bridge::roster::list_accounts,
            bridge::roster::remove_account,
            bridge::intake::read_clipboard,
            bridge::intake::import_accounts,
            bridge::login::sign_in,
            bridge::reset::clear_cache,
            bridge::preferences::get_preferences,
            bridge::preferences::save_preferences,
        ])
        .run(tauri::generate_context!())
        .expect("failed to start Roster");
}
