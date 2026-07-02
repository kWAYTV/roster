//! System tray: the menu, its actions, and close-to-tray behaviour.

mod actions;
mod menu;
mod window;

use tauri::tray::TrayIconBuilder;
use tauri::AppHandle;

const TRAY_ID: &str = "roster-tray";

/// Build the tray icon, wire up its events, and enable close-to-tray.
pub fn setup(app: &AppHandle) -> tauri::Result<()> {
    let icon = app
        .default_window_icon()
        .cloned()
        .expect("bundled window icon is required for the tray");

    TrayIconBuilder::with_id(TRAY_ID)
        .icon(icon)
        .tooltip("Roster")
        .menu(&menu::build(app)?)
        .show_menu_on_left_click(false)
        .on_menu_event(actions::on_menu)
        .on_tray_icon_event(actions::on_icon)
        .build(app)?;

    window::enable_close_to_tray(app);
    Ok(())
}

/// Reveal and focus the main window (used when a second instance launches).
pub fn focus_window(app: &AppHandle) {
    window::show(app);
}

/// Rebuild the tray menu after accounts or preferences change.
pub fn rebuild(app: &AppHandle) -> tauri::Result<()> {
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        tray.set_menu(Some(menu::build(app)?))?;
    }
    Ok(())
}
