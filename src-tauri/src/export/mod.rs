//! Export stored refresh tokens as `username----token` lines.

use std::collections::HashMap;

use crate::intake::is_jwt;
use crate::roster::Account;
use crate::steam_client::cache_dir;
use crate::steam_config::connect_cache;

/// Export lines for the given accounts using one ConnectCache read.
pub fn entries_for(accounts: &[Account]) -> Vec<String> {
    let Ok(cache) = cache_dir() else {
        return Vec::new();
    };
    let map = connect_cache::read_encrypted_map(&cache);
    accounts
        .iter()
        .filter_map(|account| entry_for_cached(account, &map))
        .collect()
}

fn entry_for_cached(account: &Account, map: &HashMap<String, String>) -> Option<String> {
    let token = read_token_for(account, map)?;
    if !is_jwt(&token) {
        return None;
    }
    let label = if account.account_name.is_empty() {
        account.steamid.clone()
    } else {
        account.account_name.clone()
    };
    Some(format!("{label}----{token}"))
}

fn read_token_for(account: &Account, map: &HashMap<String, String>) -> Option<String> {
    for name in [&account.account_name, &account.steamid] {
        if name.is_empty() {
            continue;
        }
        if let Some(token) = connect_cache::decrypt_cached(map, name) {
            return Some(token);
        }
    }
    None
}
