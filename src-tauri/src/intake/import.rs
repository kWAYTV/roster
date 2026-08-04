//! The import use case: parse entries, store tokens, optionally sign in the last one.

use std::path::Path;

use super::{batch, jwt, parse};
use crate::login::{self, SignInPrefs};
use crate::preferences;
use crate::steam_client::{cache_dir, install_dir, is_running, launch, stop};
use crate::steam_config::{config_vdf, connect_cache, loginusers};

/// Import one or more accounts from pasted `text`.
///
/// When `without_sign_in` is set, tokens are stored only — Steam is
/// restarted onto the previous session if we had to stop it for safe writes.
pub fn import_text(text: &str, without_sign_in: bool) -> Result<String, String> {
    let entries = batch::split(text);
    if entries.is_empty() {
        return Err("Nothing to import".to_string());
    }

    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    let config_dir = install.join("config");
    loginusers::require_config_files(&config_dir)?;
    let cache = cache_dir()?;
    let loginusers_path = config_dir.join("loginusers.vdf");
    let prefs = preferences::load();
    let steam_was_running = is_running();

    // Stop before any VDF/token writes so a live client cannot clobber them.
    if steam_was_running || !without_sign_in {
        stop()?;
    }

    let mut stored = 0usize;
    let mut failures: Vec<String> = Vec::new();
    let mut last: Option<(String, String)> = None;

    for (index, entry) in entries.iter().enumerate() {
        match store_entry(entry, &install, &cache, &loginusers_path) {
            Ok(account) => {
                stored += 1;
                last = Some(account);
            }
            Err(error) => failures.push(format!("#{}: {error}", index + 1)),
        }
    }

    let Some((username, steamid)) = last else {
        return Err(failures.join(" | "));
    };

    if without_sign_in {
        if steam_was_running {
            launch(&install, prefs.launch_steam_minimized)?;
        }
        return Ok(summary_store_only(stored, &username, &failures));
    }

    // Prefer the AccountName Steam already knows for this SteamID.
    let username = loginusers::account_name_for(&loginusers_path, &steamid)?
        .filter(|name| !name.is_empty())
        .unwrap_or(username);

    let sign_prefs = SignInPrefs::merge(&prefs, &Default::default(), false);
    login::activate(&username, &steamid, &install, &sign_prefs)?;
    login::relaunch(&install, &steamid, &sign_prefs)?;
    crate::metadata::mark_used(&steamid);
    Ok(summary(stored, &username, &failures))
}

/// Parse one entry and write its config + encrypted token + loginusers row.
fn store_entry(
    entry: &str,
    install: &Path,
    cache: &Path,
    loginusers_path: &Path,
) -> Result<(String, String), String> {
    let (parsed_username, token) = parse::parse(entry)?;
    if !jwt::is_importable(&token) {
        return Err("Token expired or invalid".to_string());
    }
    let steamid = jwt::steamid(&token)?;

    // ConnectCache is keyed by AccountName. Prefer the name already in loginusers
    // so a steamid----token paste never stores the token under the wrong key.
    let username = loginusers::account_name_for(loginusers_path, &steamid)?
        .filter(|name| !name.is_empty() && !parse::is_steamid(name))
        .unwrap_or(parsed_username);

    config_vdf::add_account(
        &install.join("config").join("config.vdf"),
        &username,
        &steamid,
    )?;
    loginusers::ensure_present(loginusers_path, &username, &steamid)?;
    connect_cache::store_token(cache, &username, &token)?;
    Ok((username, steamid))
}

fn summary(stored: usize, username: &str, failures: &[String]) -> String {
    let base = if stored == 1 {
        format!("Imported {username}")
    } else {
        format!("Imported {stored} accounts")
    };
    with_failures(base, failures)
}

fn summary_store_only(stored: usize, username: &str, failures: &[String]) -> String {
    let base = if stored == 1 {
        format!("Stored {username}")
    } else {
        format!("Stored {stored} accounts")
    };
    with_failures(base, failures)
}

fn with_failures(base: String, failures: &[String]) -> String {
    if failures.is_empty() {
        return base;
    }
    format!("{base} · {} failed", failures.len())
}

#[cfg(test)]
mod tests {
    use super::summary;

    #[test]
    fn summary_mentions_failures() {
        let text = summary(2, "a", &["#1: bad".into()]);
        assert!(text.contains("Imported 2 accounts"));
        assert!(text.contains("1 failed"));
    }
}
