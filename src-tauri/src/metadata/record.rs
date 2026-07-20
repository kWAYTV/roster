use serde::{Deserialize, Serialize};

/// What we remember about one account.
///
/// Times are Unix seconds (0 = unset). Overrides are `None` when the global
/// preference should win.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct AccountMetadata {
    #[serde(default)]
    pub last_used: u64,
    #[serde(default)]
    pub cooldown_until: u64,
    #[serde(default)]
    pub cooldown_duration: u64,
    #[serde(default)]
    pub pinned: bool,
    #[serde(default)]
    pub note: String,
    #[serde(default)]
    pub always_invisible: Option<bool>,
    #[serde(default)]
    pub mute_notifications: Option<bool>,
    #[serde(default)]
    pub launch_cs2: Option<bool>,
    #[serde(default)]
    pub cs2_launch_options: Option<String>,
}

impl AccountMetadata {
    /// True when this record has nothing worth keeping.
    pub fn is_empty(&self) -> bool {
        self.last_used == 0
            && self.cooldown_until == 0
            && self.cooldown_duration == 0
            && !self.pinned
            && self.note.is_empty()
            && self.always_invisible.is_none()
            && self.mute_notifications.is_none()
            && self.launch_cs2.is_none()
            && self.cs2_launch_options.is_none()
    }
}
