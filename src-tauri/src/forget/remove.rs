use crate::roster::Account;
use crate::steam_client::{cache_dir, clear_autologin_if_matches, install_dir, stop};
use crate::steam_config::{config_vdf, connect_cache, loginusers};

/// Forget an account: strip it from loginusers, config.vdf, the token cache,
/// and clear autologin if it pointed here.
pub fn remove(account: &Account) -> Result<String, String> {
    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    let config_dir = install.join("config");

    stop()?;

    loginusers::remove(&config_dir.join("loginusers.vdf"), &account.steamid)?;

    let config_vdf_path = config_dir.join("config.vdf");
    if config_vdf_path.exists() {
        config_vdf::remove_account(&config_vdf_path, &account.steamid)?;
    }

    if let Ok(cache) = cache_dir() {
        connect_cache::remove_token(&cache, &account.account_name);
    }

    clear_autologin_if_matches(&account.account_name);
    crate::metadata::forget(&account.steamid);

    Ok(format!("Removed {}.", account.display_name()))
}
