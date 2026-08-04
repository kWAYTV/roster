//! System-wide shortcuts: show/hide Roster and sign into the last-used account.

use tauri::AppHandle;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

/// Register global shortcuts after the plugin is attached.
pub fn setup(app: &AppHandle) -> Result<(), String> {
    let toggle = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyR);
    let sign_in = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyL);

    app.global_shortcut()
        .on_shortcut(toggle, |app, _shortcut, event| {
            if event.state != ShortcutState::Pressed {
                return;
            }
            crate::protocol::toggle_window(app);
        })
        .map_err(|error| error.to_string())?;

    app.global_shortcut()
        .on_shortcut(sign_in, |app, _shortcut, event| {
            if event.state != ShortcutState::Pressed {
                return;
            }
            crate::protocol::sign_in_last_used(app);
        })
        .map_err(|error| error.to_string())?;

    Ok(())
}
