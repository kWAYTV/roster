use serde::{Deserialize, Serialize};

/// User-facing toggles that shape each sign-in.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Preferences {
    #[serde(default = "enabled")]
    pub always_invisible: bool,
    #[serde(default)]
    pub cancel_downloads_on_login: bool,
    #[serde(default)]
    pub streamer_mode: bool,
    #[serde(default)]
    pub launch_steam_minimized: bool,
    #[serde(default)]
    pub mute_notifications_on_login: bool,
    #[serde(default = "enabled")]
    pub minimize_to_tray_on_close: bool,
}

impl Default for Preferences {
    fn default() -> Self {
        Self {
            always_invisible: true,
            cancel_downloads_on_login: false,
            streamer_mode: false,
            launch_steam_minimized: false,
            mute_notifications_on_login: false,
            minimize_to_tray_on_close: true,
        }
    }
}

fn enabled() -> bool {
    true
}
