//! Deep links and CLI args: `roster://signin/<steamid>`.
//!
//! Registers the `roster` URL scheme under HKCU so external tools can launch
//! sign-in without the deep-link plugin.

use std::env;
use std::path::PathBuf;

use tauri::{AppHandle, Emitter, Manager};
use winreg::enums::{HKEY_CURRENT_USER, KEY_WRITE};
use winreg::RegKey;

const SCHEME_PREFIX: &str = "roster://";
const SIGN_IN_PATH: &str = "signin/";

/// Register the URL scheme (best effort) and process launch argv.
pub fn setup(app: &AppHandle) {
    register_scheme();
    let args: Vec<String> = env::args().skip(1).collect();
    handle_args(app, &args);
}

/// Process argv from a second-instance launch (single-instance plugin).
pub fn handle_args(app: &AppHandle, args: &[String]) {
    for arg in args {
        handle_url(app, arg);
    }
}

fn handle_url(app: &AppHandle, raw: &str) {
    let Some(steamid) = parse_sign_in(raw) else {
        return;
    };
    crate::tray::focus_window(app);
    sign_in(app, &steamid);
}

fn parse_sign_in(raw: &str) -> Option<String> {
    let trimmed = raw.trim();
    let rest = trimmed
        .strip_prefix(SCHEME_PREFIX)
        .or_else(|| trimmed.strip_prefix("roster:"))?;
    let path = rest.trim_start_matches('/');
    let steamid = path.strip_prefix(SIGN_IN_PATH)?.trim_matches('/');
    if steamid.len() < 15 || !steamid.chars().all(|c| c.is_ascii_digit()) {
        return None;
    }
    Some(steamid.to_string())
}

fn sign_in(app: &AppHandle, steamid: &str) {
    let app = app.clone();
    let steamid = steamid.to_string();
    std::thread::spawn(move || {
        let Ok(account) = crate::bridge::find_account(&steamid) else {
            let _ = app.emit("status-error", "Account unavailable".to_string());
            return;
        };
        match crate::login::sign_in(&account, false) {
            Ok(message) => {
                crate::log::append(&message);
                let _ = crate::tray::rebuild(&app);
                let _ = app.emit("accounts-changed", ());
                let _ = app.emit("status", message);
            }
            Err(error) => {
                crate::log::append(format!("Error: {error}"));
                let _ = app.emit("status-error", error);
            }
        }
    });
}

/// Toggle main window visibility (global hotkey).
pub fn toggle_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();
        return;
    }
    crate::tray::focus_window(app);
}

/// Sign into the MostRecent account (global hotkey).
pub fn sign_in_last_used(app: &AppHandle) {
    let Ok(accounts) = crate::roster::list_tray() else {
        return;
    };
    let Some(account) = accounts.into_iter().find(|item| item.most_recent) else {
        let _ = app.emit("status-error", "No last-used account".to_string());
        return;
    };
    crate::tray::focus_window(app);
    let app = app.clone();
    std::thread::spawn(move || match crate::login::sign_in(&account, false) {
        Ok(message) => {
            crate::log::append(&message);
            let _ = crate::tray::rebuild(&app);
            let _ = app.emit("accounts-changed", ());
            let _ = app.emit("status", message);
        }
        Err(error) => {
            crate::log::append(format!("Error: {error}"));
            let _ = app.emit("status-error", error);
        }
    });
}

/// HKCU\Software\Classes\roster → current exe "%1"
fn register_scheme() {
    let Ok(exe) = env::current_exe() else {
        return;
    };
    let exe: PathBuf = exe.canonicalize().unwrap_or(exe);
    let command = format!("\"{}\" \"%1\"", exe.display());
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let Ok((key, _)) = hkcu.create_subkey_with_flags("Software\\Classes\\roster", KEY_WRITE) else {
        return;
    };
    let _ = key.set_value("", &"URL:Roster Protocol");
    let _ = key.set_value("URL Protocol", &"");
    let Ok((command_key, _)) = key.create_subkey_with_flags("shell\\open\\command", KEY_WRITE)
    else {
        return;
    };
    let _ = command_key.set_value("", &command);
}

#[cfg(test)]
mod tests {
    use super::parse_sign_in;

    #[test]
    fn parses_sign_in_url() {
        assert_eq!(
            parse_sign_in("roster://signin/76561198000000000"),
            Some("76561198000000000".into())
        );
        assert_eq!(
            parse_sign_in("roster://signin/76561198000000000/"),
            Some("76561198000000000".into())
        );
        assert_eq!(parse_sign_in("https://example.com"), None);
        assert_eq!(parse_sign_in("roster://signin/not-a-steamid"), None);
    }
}
