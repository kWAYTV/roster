use crate::roster::Account;
use crate::steam_client::{
    autologin_user, cache_dir, clear_autologin_if_matches, install_dir, is_running, stop,
};
use crate::steam_config::{config_vdf, connect_cache, loginusers};

/// Strip the account from Steam files and Roster stores.
///
/// Steam is only stopped when the account is the one currently signed in —
/// deleting any other account leaves Steam running so the UI doesn't bounce it.
pub fn remove(account: &Account) -> Result<String, String> {
    let _guard = crate::steam_client::mutation_guard();
    stop_if_active(account)?;
    remove_one(account)
}

pub fn remove_many(accounts: &[Account]) -> Result<String, String> {
    if accounts.is_empty() {
        return Err("No accounts selected".to_string());
    }

    let _guard = crate::steam_client::mutation_guard();
    if accounts.iter().any(is_active_login) && is_running() {
        stop()?;
    }

    let mut names: Vec<String> = Vec::with_capacity(accounts.len());
    for account in accounts {
        remove_one(account)?;
        names.push(account.display_name().to_string());
    }

    Ok(match names.len() {
        1 => format!("Removed {}", names[0]),
        n => format!("Removed {n} accounts"),
    })
}

fn stop_if_active(account: &Account) -> Result<(), String> {
    if is_active_login(account) && is_running() {
        stop()?;
    }
    Ok(())
}

fn is_active_login(account: &Account) -> bool {
    autologin_user().is_some_and(|name| name.eq_ignore_ascii_case(&account.account_name))
}

fn remove_one(account: &Account) -> Result<String, String> {
    let install = install_dir()?;
    let config_dir = install.join("config");

    loginusers::remove(&config_dir.join("loginusers.vdf"), &account.steamid)?;

    let config_vdf_path = config_dir.join("config.vdf");
    if config_vdf_path.exists() {
        config_vdf::remove_account(&config_vdf_path, &account.steamid)?;
    }

    if let Ok(cache) = cache_dir() {
        connect_cache::remove_token(&cache, &account.account_name);
    }

    clear_autologin_if_matches(&account.account_name);
    crate::tokens::remove(&account.steamid);
    crate::metadata::forget(&account.steamid);

    Ok(format!("Removed {}", account.display_name()))
}
