use crate::roster::Account;
use crate::steam_client::{
    cache_dir, clear_autologin_if_matches, install_dir, stop_if_affects_active_login,
};
use crate::steam_config::{config_vdf, connect_cache, loginusers};

/// Forget an account: strip it from loginusers, config.vdf, the token cache,
/// and clear autologin if it pointed here.
pub fn remove(account: &Account) -> Result<String, String> {
    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    let config_dir = install.join("config");

    stop_if_affects_active_login(&[&account.account_name])?;

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

    Ok(format!("Removed {}", account.display_name()))
}

/// Remove several accounts without stopping Steam unless the active login is included.
pub fn remove_many(accounts: &[Account]) -> Result<String, String> {
    if accounts.is_empty() {
        return Err("No accounts selected".to_string());
    }

    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    let config_dir = install.join("config");

    let account_names: Vec<&str> = accounts.iter().map(|a| a.account_name.as_str()).collect();
    stop_if_affects_active_login(&account_names)?;

    let mut names: Vec<String> = Vec::with_capacity(accounts.len());
    for account in accounts {
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
        names.push(account.display_name().to_string());
    }

    Ok(match names.len() {
        1 => format!("Removed {}", names[0]),
        n => format!("Removed {n} accounts"),
    })
}
