//! Resolve a usable refresh token before killing Steam.

use crate::intake::{expires_in, is_jwt};
use crate::steam_client::cache_dir;
use crate::steam_config::connect_cache;

pub fn require_usable_token(account_name: &str, steamid: &str) -> Result<(), String> {
    if let Some(token) = crate::tokens::token_for(steamid) {
        return validate(&token);
    }

    let cache = cache_dir()?;
    let map = connect_cache::read_encrypted_map(&cache);

    for name in [account_name, steamid] {
        if name.is_empty() {
            continue;
        }
        let Some(token) = connect_cache::decrypt_cached(&map, name) else {
            continue;
        };
        return validate(&token);
    }

    Err("No saved login token for this account. Re-import it.".to_string())
}

/// Write ConnectCache + config.vdf from Roster's stored JWT when present.
pub fn reprovision_from_store(
    account_name: &str,
    steamid: &str,
    install: &std::path::Path,
) -> Result<(), String> {
    let Some(token) = crate::tokens::token_for(steamid) else {
        return Ok(());
    };
    validate(&token)?;

    let cache = cache_dir()?;
    crate::steam_config::config_vdf::add_account(
        &install.join("config").join("config.vdf"),
        account_name,
        steamid,
    )?;
    connect_cache::store_token(&cache, account_name, &token)?;
    Ok(())
}

fn validate(token: &str) -> Result<(), String> {
    if !is_jwt(token) {
        return Err("No saved login token for this account. Re-import it.".to_string());
    }
    if expires_in(token) < 0 {
        return Err("Login token expired. Re-import this account.".to_string());
    }
    Ok(())
}
