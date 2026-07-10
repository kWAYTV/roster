//! Apply window preferences (capture exclusion) to the main webview.

use tauri::{AppHandle, Manager};

use super::set_exclude_from_capture;

const MAIN: &str = "main";

pub fn apply_capture_preferences(app: &AppHandle) {
    let exclude = crate::preferences::load().hide_from_capture;
    apply_capture(app, exclude);
}

pub fn apply_capture(app: &AppHandle, exclude: bool) {
    let Some(window) = app.get_webview_window(MAIN) else {
        return;
    };
    let Ok(hwnd) = window.hwnd() else {
        return;
    };
    set_exclude_from_capture(hwnd.0 as isize, exclude);
}
