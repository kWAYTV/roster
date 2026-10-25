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
    /// Seconds until JWT expiry; `-1` expired, `0` unknown/none.
    pub jwt_expires_in: i64,
    pub has_token: bool,
}

impl Account {
    /// Persona when it is a real display name, not a SteamID or `user######` placeholder.
    pub fn has_real_persona(&self) -> bool {
        crate::steam_config::loginusers::is_display_label(&self.persona_name)
    }

    /// The friendliest available name: persona, else a real login, else the SteamID.
    pub fn display_name(&self) -> &str {
        if self.has_real_persona() {
            return &self.persona_name;
        }
        if crate::steam_config::loginusers::is_display_label(&self.account_name) {
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

#[cfg(test)]
mod tests {
    use super::Account;

    #[test]
    fn generated_username_is_not_the_display_name() {
        let account = Account {
            steamid: "76561199664681954".into(),
            account_name: "user681954".into(),
            persona_name: "user681954".into(),
            ..Account::default()
        };
        assert!(!account.has_real_persona());
        assert_eq!(account.display_name(), "76561199664681954");
    }

    #[test]
    fn community_persona_wins_over_generated_login() {
        let account = Account {
            steamid: "76561199664681954".into(),
            account_name: "user681954".into(),
            persona_name: "who did".into(),
            ..Account::default()
        };
        assert_eq!(account.display_name(), "who did");
    }
}
