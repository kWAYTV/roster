//! Export stored refresh tokens as `username----token` lines.

use crate::intake::{is_jwt};
use crate::roster::Account;
use crate::steam_client::cache_dir;
use crate::steam_config::connect_cache;

/// Format one account's cached token for export, if decryptable.
pub fn entry_for(account: &Account) -> Option<String> {
    let cache = cache_dir().ok()?;
    let token = read_token_for(account, &cache)?;
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

pub fn entries_for(accounts: &[Account]) -> Vec<String> {
    accounts.iter().filter_map(entry_for).collect()
}

fn read_token_for(account: &Account, cache: &std::path::Path) -> Option<String> {
    for name in [&account.account_name, &account.steamid] {
        if name.is_empty() {
            continue;
        }
        if let Some(token) = connect_cache::read_token(cache, name) {
            return Some(token);
        }
    }
    None
}
