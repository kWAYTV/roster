use super::{activate, relaunch, token};
use crate::login::activate::SignInPrefs;
use crate::preferences;
use crate::roster::Account;
use crate::steam_client::{install_dir, stop};

pub fn sign_in(account: &Account, force_invisible: bool) -> Result<String, String> {
    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    let global = preferences::load();
    let prefs = SignInPrefs::merge(&global, &account.metadata, force_invisible);

    token::require_usable_token(&account.account_name, &account.steamid)?;

    stop()?;
    token::reprovision_from_store(&account.account_name, &account.steamid, &install)?;
    activate(&account.account_name, &account.steamid, &install, &prefs)?;
    relaunch(&install, &account.steamid, &prefs)?;
    crate::metadata::mark_used(&account.steamid);

    Ok(format!("Signed in as {}", account.display_name()))
}
