use winreg::enums::{HKEY_CURRENT_USER, KEY_QUERY_VALUE, KEY_SET_VALUE};
use winreg::RegKey;

const STEAM_KEY: &str = "SOFTWARE\\Valve\\Steam";

pub fn autologin_user() -> Option<String> {
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(STEAM_KEY, KEY_QUERY_VALUE)
        .ok()?;
    let current: String = key.get_value("AutoLoginUser").unwrap_or_default();
    if current.is_empty() {
        None
    } else {
        Some(current)
    }
}

pub fn set_autologin_user(account_name: &str) -> Result<(), String> {
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(STEAM_KEY, KEY_SET_VALUE)
        .map_err(|_| "Could not open the Steam registry key.".to_string())?;
    key.set_value("AutoLoginUser", &account_name)
        .map_err(|_| "Could not set the autologin user.".to_string())?;
    key.set_value("RememberPassword", &1u32)
        .map_err(|_| "Could not set the remember-password flag.".to_string())?;
    Ok(())
}

pub fn clear_autologin_if_matches(account_name: &str) {
    let Ok(key) = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(STEAM_KEY, KEY_QUERY_VALUE | KEY_SET_VALUE)
    else {
        return;
    };
    let current: String = key.get_value("AutoLoginUser").unwrap_or_default();
    if current.eq_ignore_ascii_case(account_name) {
        let _ = key.set_value("AutoLoginUser", &"");
    }
}
