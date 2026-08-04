//! Token health check without signing in.

use serde::Serialize;

use crate::intake::{expires_in, is_jwt};
use crate::steam_client::cache_dir;
use crate::steam_config::connect_cache;

#[derive(Serialize)]
pub struct TokenHealth {
    pub steamid: String,
    pub account_name: String,
    pub status: &'static str,
    pub jwt_expires_in: i64,
}

/// Decrypt each roster token and report ok / expired / missing / invalid.
#[tauri::command]
pub fn check_tokens() -> Result<Vec<TokenHealth>, String> {
    let accounts = crate::roster::list()?;
    let connect_map = cache_dir()
        .ok()
        .map(|dir| connect_cache::read_encrypted_map(&dir));
    let mut out = Vec::with_capacity(accounts.len());

    for account in accounts {
        let token = crate::tokens::token_for(&account.steamid).or_else(|| {
            let map = connect_map.as_ref()?;
            [&account.account_name, &account.steamid]
                .into_iter()
                .filter(|name| !name.is_empty())
                .find_map(|name| connect_cache::decrypt_cached(map, name))
        });

        let (status, jwt_expires_in) = match token {
            None => ("missing", 0_i64),
            Some(value) if !is_jwt(&value) => ("invalid", 0_i64),
            Some(value) => {
                let remaining = expires_in(&value);
                if remaining < 0 {
                    ("expired", remaining)
                } else {
                    ("ok", remaining)
                }
            }
        };

        out.push(TokenHealth {
            steamid: account.steamid,
            account_name: account.account_name,
            status,
            jwt_expires_in,
        });
    }

    Ok(out)
}
