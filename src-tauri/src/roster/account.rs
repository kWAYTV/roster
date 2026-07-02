use std::path::PathBuf;

use crate::metadata::AccountMetadata;

/// A remembered Steam account and the metadata we show for it.
#[derive(Clone, Default)]
pub struct Account {
    pub steamid: String,
    pub account_name: String,
    pub persona_name: String,
    pub avatar_hash: Option<String>,
    pub avatar_path: Option<PathBuf>,
    pub most_recent: bool,
    pub metadata: AccountMetadata,
}

impl Account {
    /// The friendliest available name: persona if set, else the login name.
    pub fn display_name(&self) -> &str {
        if self.persona_name.is_empty() {
            &self.account_name
        } else {
            &self.persona_name
        }
    }

    /// Up to two uppercase alphanumeric characters for the avatar fallback.
    pub fn initials(&self) -> String {
        let initials: String = self
            .display_name()
            .chars()
            .filter(|c| c.is_alphanumeric())
            .take(2)
            .collect::<String>()
            .to_uppercase();
        if initials.is_empty() {
            "?".to_string()
        } else {
            initials
        }
    }
}
