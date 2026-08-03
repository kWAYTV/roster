//! Gate sign-in on a decryptable, unexpired ConnectCache refresh token.

use crate::intake::{expires_in, is_jwt};
use crate::steam_client::cache_dir;
use crate::steam_config::connect_cache;

/// Fail before killing Steam when this account has nothing usable to autologin with.
pub fn require_usable_token(account_name: &str, steamid: &str) -> Result<(), String> {
    let cache = cache_dir()?;
    let map = connect_cache::read_encrypted_map(&cache);

    for name in [account_name, steamid] {
        if name.is_empty() {
            continue;
        }
        let Some(token) = connect_cache::decrypt_cached(&map, name) else {
            continue;
        };
        if !is_jwt(&token) {
            continue;
        }
        if expires_in(&token) < 0 {
            return Err("Login token expired. Re-import this account.".to_string());
        }
        return Ok(());
    }

    Err("No saved login token for this account. Re-import it.".to_string())
}
