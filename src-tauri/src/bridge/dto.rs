use std::path::Path;

use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use serde::Serialize;

use crate::roster::Account;

/// Account shape sent to the frontend, with the avatar inlined as a data URL.
#[derive(Serialize)]
pub struct AccountView {
    pub steamid: String,
    pub account_name: String,
    pub persona_name: String,
    pub display_name: String,
    pub initials: String,
    pub most_recent: bool,
    pub avatar: Option<String>,
    pub last_used: u64,
    pub cooldown_until: u64,
    pub cooldown_duration: u64,
}

impl From<&Account> for AccountView {
    fn from(account: &Account) -> Self {
        AccountView {
            steamid: account.steamid.clone(),
            account_name: account.account_name.clone(),
            persona_name: account.persona_name.clone(),
            display_name: account.display_name().to_string(),
            initials: account.initials(),
            most_recent: account.most_recent,
            avatar: account.avatar_path.as_deref().and_then(avatar_data_url),
            last_used: account.metadata.last_used,
            cooldown_until: account.metadata.cooldown_until,
            cooldown_duration: account.metadata.cooldown_duration,
        }
    }
}

fn avatar_data_url(path: &Path) -> Option<String> {
    let bytes = std::fs::read(path).ok()?;
    let mime = match path.extension().and_then(|e| e.to_str()) {
        Some(ext) if ext.eq_ignore_ascii_case("jpg") || ext.eq_ignore_ascii_case("jpeg") => {
            "image/jpeg"
        }
        _ => "image/png",
    };
    Some(format!("data:{mime};base64,{}", STANDARD.encode(bytes)))
}
