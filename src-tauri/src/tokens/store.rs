use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

const FILE: &str = "tokens.json";

#[derive(Clone, Default, Serialize, Deserialize)]
pub struct TokenRecord {
    pub account_name: String,
    #[serde(default)]
    pub persona_name: String,
    pub token: String,
}

type Store = HashMap<String, TokenRecord>;

pub fn all() -> Store {
    match fs::read_to_string(path()) {
        Ok(raw) => serde_json::from_str(&raw).unwrap_or_else(|_| {
            let _ = fs::rename(path(), path().with_extension("json.corrupt"));
            Store::new()
        }),
        Err(_) => Store::new(),
    }
}

pub fn get(steamid: &str) -> Option<TokenRecord> {
    all().get(steamid).cloned()
}

pub fn token_for(steamid: &str) -> Option<String> {
    get(steamid).map(|record| record.token)
}

pub fn save(steamid: &str, account_name: &str, persona_name: &str, token: &str) {
    let mut records = all();
    records.insert(
        steamid.to_string(),
        TokenRecord {
            account_name: account_name.to_string(),
            persona_name: persona_name.to_string(),
            token: token.to_string(),
        },
    );
    let _ = persist(&records);
}

pub fn remove(steamid: &str) {
    let mut records = all();
    if records.remove(steamid).is_some() {
        let _ = persist(&records);
    }
}

pub fn clear_all() -> Result<(), String> {
    persist(&Store::new())
}

fn persist(records: &Store) -> Result<(), String> {
    let path = path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create token store dir: {e}"))?;
    }
    let json = serde_json::to_string_pretty(records)
        .map_err(|e| format!("Failed to encode token store: {e}"))?;
    fs::write(&path, json).map_err(|e| format!("Failed to write token store: {e}"))
}

fn path() -> PathBuf {
    crate::app_data::dir().join(FILE)
}

#[cfg(test)]
mod tests {
    use super::TokenRecord;

    #[test]
    fn serializes_record() {
        let record = TokenRecord {
            account_name: "alice".into(),
            persona_name: "Alice".into(),
            token: "eyJ.abc.def".into(),
        };
        let json = serde_json::to_string(&record).unwrap();
        let back: TokenRecord = serde_json::from_str(&json).unwrap();
        assert_eq!(back.account_name, "alice");
        assert_eq!(back.token, "eyJ.abc.def");
    }
}
