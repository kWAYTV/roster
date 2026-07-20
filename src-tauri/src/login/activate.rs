use std::path::Path;

use crate::metadata::AccountMetadata;
use crate::preferences::Preferences;
use crate::presence::{downloads, launch_options, notifications, persona};
use crate::steam_client::{localconfig_path, set_autologin_user, steamid3_from_steamid64};
use crate::steam_config::{localconfig, loginusers};
use crate::vdf::replace_key_line;

/// Effective sign-in preferences after merging globals with per-account overrides.
#[derive(Debug, Clone)]
pub struct SignInPrefs {
    pub always_invisible: bool,
    pub cancel_downloads_on_login: bool,
    pub launch_steam_minimized: bool,
    pub mute_notifications_on_login: bool,
    pub launch_cs2_on_login: bool,
    pub cs2_launch_options: String,
}

impl SignInPrefs {
    pub fn merge(global: &Preferences, meta: &AccountMetadata, force_invisible: bool) -> Self {
        Self {
            always_invisible: force_invisible
                || meta.always_invisible.unwrap_or(global.always_invisible),
            cancel_downloads_on_login: global.cancel_downloads_on_login,
            launch_steam_minimized: global.launch_steam_minimized,
            mute_notifications_on_login: meta
                .mute_notifications
                .unwrap_or(global.mute_notifications_on_login),
            launch_cs2_on_login: meta.launch_cs2.unwrap_or(global.launch_cs2_on_login),
            cs2_launch_options: meta
                .cs2_launch_options
                .clone()
                .unwrap_or_else(|| global.cs2_launch_options.clone()),
        }
    }
}

/// Make an account the active login: mark it recent, apply presence
/// preferences, and set Steam's autologin user.
pub fn activate(
    username: &str,
    steamid: &str,
    install: &Path,
    prefs: &SignInPrefs,
) -> Result<(), String> {
    let loginusers_path = install.join("config").join("loginusers.vdf");
    loginusers::set_active(&loginusers_path, username, steamid)?;
    apply_localconfig(steamid, install, prefs)?;
    set_autologin_user(username)
}

fn apply_localconfig(steamid: &str, install: &Path, prefs: &SignInPrefs) -> Result<(), String> {
    let steamid3 = steamid3_from_steamid64(steamid)?;
    let path = localconfig_path(install, &steamid3);

    let mut content = localconfig::load_or_template(&path);
    content = persona::apply(&content, &steamid3, prefs.always_invisible);
    content = replace_key_line(&content, "SignIntoFriends", "1");
    if prefs.mute_notifications_on_login {
        content = notifications::mute(&content);
    }
    if prefs.cancel_downloads_on_login {
        content = downloads::pause(&content);
    }
    if prefs.launch_cs2_on_login || !prefs.cs2_launch_options.is_empty() {
        content = launch_options::apply(&content, &prefs.cs2_launch_options);
    }

    localconfig::save(&path, &content)
}
