//! Roster: a Windows Steam login switcher.
//!
//! Screaming architecture: modules are named for what the app *does*
//! (`roster`, `intake`, `login`, `forget`, `export`, `reset`, `preferences`,
//! `presence`, `status`, `cooldown` via `metadata`). Steam/Windows integration
//! stays behind capability edges (`vdf`, `steam_config`, `steam_client`,
//! `secret`). `bridge`, `tray`, and `window` are delivery edges — not domain.

mod bridge;
mod export;
mod forget;
mod intake;
mod log;
mod login;
mod metadata;
mod preferences;
mod presence;
mod reset;
mod roster;
mod secret;
mod status;
mod steam_client;
mod steam_config;
mod tray;
mod vdf;
mod window;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            tray::focus_window(app);
        }))
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            tray::setup(app.handle())?;
            metadata::start_cooldown_watch(app.handle().clone());
            window::apply_capture_preferences(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            bridge::roster::list_accounts,
            bridge::roster::remove_account,
            bridge::roster::remove_accounts,
            bridge::intake::read_clipboard,
            bridge::intake::classify_import,
            bridge::intake::import_accounts,
            bridge::login::sign_in,
            bridge::cooldown::set_cooldown,
            bridge::cooldown::clear_cooldown,
            bridge::cooldown::set_cooldown_many,
            bridge::cooldown::clear_cooldown_many,
            bridge::metadata::set_pinned,
            bridge::metadata::set_note,
            bridge::metadata::set_account_overrides,
            bridge::metadata::export_metadata,
            bridge::metadata::import_metadata,
            bridge::status::refresh_statuses,
            bridge::reset::clear_cache,
            bridge::preferences::get_preferences,
            bridge::preferences::save_preferences,
            bridge::export::export_token_entries,
            bridge::util::write_clipboard,
            bridge::util::open_steam_profile,
            bridge::util::open_external_url,
            bridge::logs::get_logs,
            bridge::logs::clear_logs,
        ])
        .run(tauri::generate_context!())
        .expect("failed to start Roster");
}
