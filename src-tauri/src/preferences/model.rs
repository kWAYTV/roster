use serde::{Deserialize, Deserializer, Serialize};

/// Appearance preference stored with the rest of app settings.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum ThemePreference {
    #[default]
    Dark,
    Light,
    System,
}

/// Whether import stores tokens only, always signs in, or asks each time.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum ImportWithoutSignIn {
    #[default]
    Off,
    Ask,
    On,
}

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
    #[serde(default, deserialize_with = "deserialize_import_without_sign_in")]
    pub import_without_sign_in: ImportWithoutSignIn,
    /// Toast when a JWT expires within this many days (0 = off).
    #[serde(default = "default_jwt_warn_days")]
    pub warn_jwt_expiry_days: u32,
    /// When a cooldown ends, sign into that account automatically.
    #[serde(default)]
    pub auto_sign_in_on_cooldown: bool,
    /// App color scheme. Defaults to dark.
    #[serde(default)]
    pub theme: ThemePreference,
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
            import_without_sign_in: ImportWithoutSignIn::Off,
            warn_jwt_expiry_days: default_jwt_warn_days(),
            auto_sign_in_on_cooldown: false,
            theme: ThemePreference::Dark,
        }
    }
}

fn enabled() -> bool {
    true
}

fn default_jwt_warn_days() -> u32 {
    7
}

/// Accept legacy booleans (`true`/`false`) and the off/ask/on strings.
fn deserialize_import_without_sign_in<'de, D>(
    deserializer: D,
) -> Result<ImportWithoutSignIn, D::Error>
where
    D: Deserializer<'de>,
{
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum Wire {
        Bool(bool),
        Mode(ImportWithoutSignIn),
    }

    Ok(match Wire::deserialize(deserializer)? {
        Wire::Bool(true) => ImportWithoutSignIn::On,
        Wire::Bool(false) => ImportWithoutSignIn::Off,
        Wire::Mode(mode) => mode,
    })
}

#[cfg(test)]
mod tests {
    use super::{ImportWithoutSignIn, Preferences};

    #[test]
    fn import_without_sign_in_defaults_off() {
        let prefs: Preferences = serde_json::from_str("{}").unwrap();
        assert_eq!(prefs.import_without_sign_in, ImportWithoutSignIn::Off);
    }

    #[test]
    fn import_without_sign_in_migrates_bool() {
        let on: Preferences = serde_json::from_str(r#"{"import_without_sign_in":true}"#).unwrap();
        assert_eq!(on.import_without_sign_in, ImportWithoutSignIn::On);

        let off: Preferences = serde_json::from_str(r#"{"import_without_sign_in":false}"#).unwrap();
        assert_eq!(off.import_without_sign_in, ImportWithoutSignIn::Off);
    }

    #[test]
    fn import_without_sign_in_reads_modes() {
        let ask: Preferences = serde_json::from_str(r#"{"import_without_sign_in":"ask"}"#).unwrap();
        assert_eq!(ask.import_without_sign_in, ImportWithoutSignIn::Ask);

        let on: Preferences = serde_json::from_str(r#"{"import_without_sign_in":"on"}"#).unwrap();
        assert_eq!(on.import_without_sign_in, ImportWithoutSignIn::On);
    }
}
