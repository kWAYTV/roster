use tauri::menu::MenuEvent;
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconEvent};
use tauri::{AppHandle, Emitter};

use super::menu::{IMPORT, QUIT, SHOW, SIGN_IN_INVISIBLE_PREFIX, SIGN_IN_PREFIX};
use super::{rebuild, window};

/// Handle a click on any tray menu item.
pub(super) fn on_menu(app: &AppHandle, event: MenuEvent) {
    match event.id.as_ref() {
        SHOW => window::show(app),
        QUIT => app.exit(0),
        IMPORT => import(app),
        id if id.starts_with(SIGN_IN_INVISIBLE_PREFIX) => {
            sign_in(
                app,
                id.trim_start_matches(SIGN_IN_INVISIBLE_PREFIX),
                true,
            );
        }
        id if id.starts_with(SIGN_IN_PREFIX) => {
            sign_in(app, id.trim_start_matches(SIGN_IN_PREFIX), false);
        }
        _ => {}
    }
}

/// Show the window on a left click of the tray icon.
pub(super) fn on_icon(tray: &TrayIcon, event: TrayIconEvent) {
    if let TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Up,
        ..
    } = event
    {
        window::show(tray.app_handle());
    }
}

/// Open the import dialog prefilled with the clipboard, so tray imports get
/// the same preview and confirm step as window imports.
fn import(app: &AppHandle) {
    window::show(app);
    let _ = app.emit("import-request", clipboard_or_empty());
}

fn sign_in(app: &AppHandle, steamid: &str, force_invisible: bool) {
    let Ok(account) = crate::bridge::find_account(steamid) else {
        return;
    };
    match crate::login::sign_in(&account, force_invisible) {
        Ok(message) => announce(app, message),
        Err(error) => {
            crate::log::append(format!("Error: {error}"));
            let _ = app.emit("status-error", error);
        }
    }
}

fn announce(app: &AppHandle, message: String) {
    crate::log::append(&message);
    let _ = rebuild(app);
    let _ = app.emit("accounts-changed", ());
    let _ = app.emit("status", message);
}

fn clipboard_or_empty() -> String {
    crate::intake::read_clipboard().unwrap_or_default()
}
