use serde::{Deserialize, Serialize};

/// User-facing toggles that shape each sign-in and app behaviour.
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
    #[serde(default = "enabled")]
    pub hide_from_capture: bool,
    #[serde(default)]
    pub show_log_panel: bool,
    #[serde(default)]
    pub launch_cs2_on_login: bool,
    #[serde(default)]
    pub cs2_launch_options: String,
    /// Store tokens without stopping Steam / signing into the last import.
    #[serde(default)]
    pub import_without_sign_in: bool,
    /// Toast when a JWT expires within this many days (0 = off).
    #[serde(default = "default_jwt_warn_days")]
    pub warn_jwt_expiry_days: u32,
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
            hide_from_capture: true,
            show_log_panel: false,
            launch_cs2_on_login: false,
            cs2_launch_options: String::new(),
            import_without_sign_in: false,
            warn_jwt_expiry_days: default_jwt_warn_days(),
        }
    }
}

fn enabled() -> bool {
    true
}

fn default_jwt_warn_days() -> u32 {
    7
}
