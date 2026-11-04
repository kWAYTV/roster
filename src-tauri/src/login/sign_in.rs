use super::{activate, relaunch, token};
use crate::login::activate::SignInPrefs;
use crate::preferences;
use crate::roster::Account;
use crate::steam_client::{install_dir, stop};
use crate::steam_config::{config_vdf, loginusers};

pub fn sign_in(account: &Account, force_invisible: bool) -> Result<String, String> {
    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    let global = preferences::load();
    let prefs = SignInPrefs::merge(&global, &account.metadata, force_invisible);

    let login_name = resolve_steam_login_name(account, &install)?;
    token::require_usable_token(&login_name, &account.steamid)?;

    stop()?;
    token::reprovision_from_store(&login_name, &account.steamid, &install)?;
    activate(&login_name, &account.steamid, &install, &prefs)?;
    relaunch(&install, &account.steamid, &prefs)?;
    crate::metadata::mark_used(&account.steamid);

    Ok(format!("Signed in as {}", account.display_name()))
}

/// ConnectCache / AutoLoginUser key. Prefer a real Steam login when one is already
/// known locally; otherwise the synthetic `user######` from `steamid----token` is fine
/// — Steam authenticates from the JWT `sub`, not the cache key string.
fn resolve_steam_login_name(
    account: &Account,
    install: &std::path::Path,
) -> Result<String, String> {
    let stored = crate::tokens::account_name_for(&account.steamid).unwrap_or_default();
    let from_config = config_vdf::account_name_for_steamid(
        &install.join("config").join("config.vdf"),
        &account.steamid,
    )
    .ok()
    .flatten()
    .unwrap_or_default();
    let login = loginusers::prefer_login_name(
        &account.account_name,
        &loginusers::prefer_login_name(&stored, &from_config),
    );
    if login.is_empty() {
        return Err("No Steam login name for this account. Re-import it.".to_string());
    }
    if loginusers::is_display_label(&login) && (login != account.account_name || login != stored) {
        let path = install.join("config").join("loginusers.vdf");
        let _ = loginusers::set_account_name_if_placeholder(&path, &account.steamid, &login);
        let _ = crate::tokens::set_account_name(&account.steamid, &login);
        let _ = config_vdf::add_account(
            &install.join("config").join("config.vdf"),
            &login,
            &account.steamid,
        );
    }
    Ok(login)
}
