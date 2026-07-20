use std::collections::HashMap;
use std::fs;

use super::account::Account;
use super::avatar;
use crate::intake::{expires_in, is_jwt};
use crate::steam_client::{cache_dir, install_dir};
use crate::steam_config::connect_cache;
use crate::vdf::quoted_fields;

/// All remembered accounts, most-recent first then alphabetical by display name.
pub fn list() -> Result<Vec<Account>, String> {
    load_accounts(true)
}

/// Account list for tray rebuilds — skips JWT decryption.
pub fn list_tray() -> Result<Vec<Account>, String> {
    load_accounts(false)
}

/// SteamIDs only — for background status sweeps.
pub fn steamids() -> Result<Vec<String>, String> {
    let install = install_dir()?;
    let path = install.join("config").join("loginusers.vdf");
    let content = fs::read_to_string(&path)
        .map_err(|_| "Open Steam once to create login data".to_string())?;
    Ok(parse(&content)
        .into_iter()
        .map(|account| account.steamid)
        .collect())
}

fn load_accounts(enrich_jwt: bool) -> Result<Vec<Account>, String> {
    let install = install_dir()?;
    let path = install.join("config").join("loginusers.vdf");
    let content = fs::read_to_string(&path)
        .map_err(|_| "Open Steam once to create login data".to_string())?;

    let mut accounts = parse(&content);
    let metadata = crate::metadata::all();
    let token_cache = if enrich_jwt {
        cache_dir()
            .ok()
            .map(|dir| connect_cache::read_encrypted_map(&dir))
    } else {
        None
    };

    for account in &mut accounts {
        account.avatar_path = avatar::resolve(&install, account);
        account.metadata = metadata
            .get(&account.steamid)
            .cloned()
            .unwrap_or_default();
        if let Some(map) = token_cache.as_ref() {
            account.jwt_expires_in = jwt_expires_in(map, account);
        }
    }

    accounts.sort_by(|a, b| {
        b.metadata
            .pinned
            .cmp(&a.metadata.pinned)
            .then_with(|| b.most_recent.cmp(&a.most_recent))
            .then_with(|| a.display_name().cmp(b.display_name()))
    });
    Ok(accounts)
}

fn jwt_expires_in(map: &HashMap<String, String>, account: &Account) -> i64 {
    for name in [&account.account_name, &account.steamid] {
        if name.is_empty() {
            continue;
        }
        if let Some(token) = connect_cache::decrypt_cached(map, name) {
            if is_jwt(&token) {
                return expires_in(&token);
            }
        }
    }
    0
}

/// Parse the `steamid { field ... }` blocks into accounts.
fn parse(content: &str) -> Vec<Account> {
    let mut accounts = Vec::new();
    let mut current: Option<Account> = None;

    for line in content.lines() {
        let fields = quoted_fields(line);

        if fields.len() == 1 && is_steamid64(&fields[0]) {
            current = Some(Account {
                steamid: fields[0].clone(),
                ..Account::default()
            });
            continue;
        }

        if line.trim() == "}" {
            if let Some(account) = current.take() {
                if !account.steamid.is_empty() {
                    accounts.push(account);
                }
            }
            continue;
        }

        if let (Some(account), 2) = (current.as_mut(), fields.len()) {
            assign_field(account, &fields[0], &fields[1]);
        }
    }

    accounts
}

fn assign_field(account: &mut Account, key: &str, value: &str) {
    match key {
        "AccountName" => account.account_name = value.to_string(),
        "PersonaName" => account.persona_name = value.to_string(),
        "Avatar" => account.avatar_hash = Some(value.to_string()),
        "MostRecent" => account.most_recent = value == "1",
        _ => {}
    }
}

fn is_steamid64(value: &str) -> bool {
    value.len() >= 16 && value.chars().all(|c| c.is_ascii_digit())
}

#[cfg(test)]
mod tests {
    use super::parse;

    #[test]
    fn parses_two_accounts() {
        let content = "\"users\"\n{\n\t\"76561199843081825\"\n\t{\n\t\t\"AccountName\"\t\t\"a\"\n\t\t\"PersonaName\"\t\t\"Alpha\"\n\t\t\"MostRecent\"\t\t\"1\"\n\t}\n\t\"76561199194545602\"\n\t{\n\t\t\"AccountName\"\t\t\"b\"\n\t}\n}\n";
        let accounts = parse(content);
        assert_eq!(accounts.len(), 2);
        assert_eq!(accounts[0].display_name(), "Alpha");
        assert!(accounts[0].most_recent);
    }
}
