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
    /// Seconds until JWT expiry; `-1` expired/missing, `0` unknown.
    pub jwt_expires_in: i64,
}

impl Account {
    /// Persona from loginusers.vdf when it looks like a real display name.
    pub fn has_real_persona(&self) -> bool {
        !self.persona_name.is_empty() && !looks_like_steamid(&self.persona_name)
    }

    /// The friendliest available name: persona if set, else the login name.
    pub fn display_name(&self) -> &str {
        if self.has_real_persona() {
            return &self.persona_name;
        }
        if !self.account_name.is_empty() && !looks_like_steamid(&self.account_name) {
            return &self.account_name;
        }
        &self.steamid
    }

    /// Up to two uppercase alphanumeric characters for the avatar fallback.
    pub fn initials(&self) -> String {
        let name = self.display_name();
        if looks_like_steamid(name) {
            return "?".to_string();
        }
        let initials: String = name
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

fn looks_like_steamid(value: &str) -> bool {
    value.len() >= 16 && value.chars().all(|c| c.is_ascii_digit())
}
