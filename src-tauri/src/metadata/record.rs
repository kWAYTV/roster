use serde::{Deserialize, Serialize};

/// What we remember about one account, all as Unix seconds (0 = unset).
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct AccountMetadata {
    #[serde(default)]
    pub last_used: u64,
    #[serde(default)]
    pub cooldown_until: u64,
    #[serde(default)]
    pub cooldown_duration: u64,
}
