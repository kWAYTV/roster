use tauri::{AppHandle, Manager, WindowEvent};
use tauri_plugin_notification::NotificationExt;

const MAIN: &str = "main";

/// Reveal and focus the main window.
pub(super) fn show(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN) {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
        crate::window::apply_capture_preferences(app);
    }
}

/// On close, either hide to the tray or quit — per user preference.
pub(super) fn enable_close_to_tray(app: &AppHandle) {
    let Some(window) = app.get_webview_window(MAIN) else {
        return;
    };
    let handle = app.clone();
    let hidden = window.clone();
    window.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            if crate::preferences::load().minimize_to_tray_on_close {
                api.prevent_close();
                let _ = hidden.hide();
                let _ = handle
                    .notification()
                    .builder()
                    .title("Roster")
                    .body("Still running in the tray. Click the icon to reopen.")
                    .show();
            }
        }
    });
}
