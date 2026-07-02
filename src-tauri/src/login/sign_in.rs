use super::{activate, relaunch};
use crate::preferences;
use crate::roster::Account;
use crate::steam_client::{install_dir, stop};

/// Full sign-in use case for an already-stored account.
pub fn sign_in(account: &Account) -> Result<String, String> {
    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    let prefs = preferences::load();

    stop()?;
    activate(&account.account_name, &account.steamid, &install, &prefs)?;
    relaunch(&install, &account.steamid, &prefs)?;
    crate::metadata::mark_used(&account.steamid);

    Ok(format!(
        "Signed in as {}. Starting Steam.",
        account.display_name()
    ))
}
