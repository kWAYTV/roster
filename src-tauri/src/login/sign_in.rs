use super::{activate, relaunch, token};
use crate::login::activate::SignInPrefs;
use crate::preferences;
use crate::roster::Account;
use crate::steam_client::{install_dir, stop};
use crate::steam_config::loginusers;

pub fn sign_in(account: &Account, force_invisible: bool) -> Result<String, String> {
    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    let global = preferences::load();
    let prefs = SignInPrefs::merge(&global, &account.metadata, force_invisible);

    require_steam_login_name(account)?;
    token::require_usable_token(&account.account_name, &account.steamid)?;

    stop()?;
    token::reprovision_from_store(&account.account_name, &account.steamid, &install)?;
    activate(&account.account_name, &account.steamid, &install, &prefs)?;
    relaunch(&install, &account.steamid, &prefs)?;
    crate::metadata::mark_used(&account.steamid);

    Ok(format!("Signed in as {}", account.display_name()))
}

/// Steam ConnectCache / AutoLoginUser need a real account name. Our `user######`
/// placeholder authenticates enough to launch, then hangs on "Loading user data".
fn require_steam_login_name(account: &Account) -> Result<(), String> {
    if loginusers::is_generated_username(&account.account_name) {
        return Err(
            "No Steam login name for this account. Re-import as username----token.".to_string(),
        );
    }
    Ok(())
}
