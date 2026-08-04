//! Export refresh tokens as `username----token` lines.

use crate::intake::is_jwt;
use crate::roster::Account;
use crate::steam_client::cache_dir;
use crate::steam_config::connect_cache;

pub fn entries_for(accounts: &[Account]) -> Vec<String> {
    let connect_map = cache_dir()
        .ok()
        .map(|dir| connect_cache::read_encrypted_map(&dir));

    accounts
        .iter()
        .filter_map(|account| entry_for(account, connect_map.as_ref()))
        .collect()
}

fn entry_for(
    account: &Account,
    connect_map: Option<&std::collections::HashMap<String, String>>,
) -> Option<String> {
    let token = read_token_for(account, connect_map)?;
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

fn read_token_for(
    account: &Account,
    connect_map: Option<&std::collections::HashMap<String, String>>,
) -> Option<String> {
    if let Some(token) = crate::tokens::token_for(&account.steamid) {
        return Some(token);
    }

    let map = connect_map?;
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
