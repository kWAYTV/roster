//! Parse pasted account entries, store tokens, optionally sign in the last one.

use std::path::Path;

use super::{batch, jwt, parse};
use crate::login::{self, SignInPrefs};
use crate::preferences;
use crate::steam_client::{cache_dir, install_dir, stop, while_stopped};
use crate::steam_config::{config_vdf, connect_cache, loginusers};

/// Import accounts from `text`.
///
/// Default: stop Steam, store entries, sign into the last one, relaunch.
/// With `without_sign_in`: stop only if running, store, restore Steam afterward.
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

    if without_sign_in {
        return while_stopped(&install, prefs.launch_steam_minimized, || {
            let outcome = store_entries(&entries, &install, &cache, &loginusers_path)?;
            Ok(summary_store_only(
                outcome.stored,
                &outcome.username,
                &outcome.failures,
            ))
        });
    }

    stop()?;

    let outcome = store_entries(&entries, &install, &cache, &loginusers_path)?;

    let username = loginusers::account_name_for(&loginusers_path, &outcome.steamid)?
        .filter(|name| !name.is_empty())
        .unwrap_or(outcome.username);

    let sign_prefs = SignInPrefs::merge(&prefs, &Default::default(), false);
    login::activate(&username, &outcome.steamid, &install, &sign_prefs)?;
    login::relaunch(&install, &outcome.steamid, &sign_prefs)?;
    crate::metadata::mark_used(&outcome.steamid);
    Ok(summary(outcome.stored, &username, &outcome.failures))
}

struct StoreOutcome {
    stored: usize,
    username: String,
    steamid: String,
    failures: Vec<String>,
}

fn store_entries(
    entries: &[String],
    install: &Path,
    cache: &Path,
    loginusers_path: &Path,
) -> Result<StoreOutcome, String> {
    let mut stored = 0usize;
    let mut failures: Vec<String> = Vec::new();
    let mut last: Option<(String, String)> = None;

    for (index, entry) in entries.iter().enumerate() {
        match store_entry(entry, install, cache, loginusers_path) {
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

    Ok(StoreOutcome {
        stored,
        username,
        steamid,
        failures,
    })
}

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

    let username = loginusers::account_name_for(loginusers_path, &steamid)?
        .filter(|name| !name.is_empty() && !parse::is_steamid(name))
        .unwrap_or(parsed_username);

    config_vdf::add_account(
        &install.join("config").join("config.vdf"),
        &username,
        &steamid,
    )?;
    let persona = persona_to_store(&username, community_persona(&username, &steamid).as_deref());
    loginusers::ensure_present(loginusers_path, &username, &persona, &steamid)?;
    connect_cache::store_token(cache, &username, &token)?;
    crate::tokens::save(&steamid, &username, &persona, &token);
    Ok((username, steamid))
}

/// Persona written next to a new account. Real logins are kept; placeholders
/// are replaced with the public Steam profile name when we can read one.
pub(crate) fn persona_to_store(username: &str, fetched: Option<&str>) -> String {
    use crate::steam_config::loginusers::{is_display_label, sanitize_persona};

    if is_display_label(username) {
        return username.to_string();
    }
    fetched
        .map(sanitize_persona)
        .filter(|name| is_display_label(name))
        .unwrap_or_default()
}

fn community_persona(username: &str, steamid: &str) -> Option<String> {
    if crate::steam_config::loginusers::is_display_label(username) {
        return None;
    }
    crate::status::lookup_persona(steamid)
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
    use super::{persona_to_store, summary};

    #[test]
    fn placeholder_login_uses_fetched_persona() {
        assert_eq!(persona_to_store("user681954", Some("who did")), "who did");
        assert_eq!(persona_to_store("user681954", None), "");
        assert_eq!(persona_to_store("bill2003", Some("ignored")), "bill2003");
    }

    #[test]
    fn summary_mentions_failures() {
        let text = summary(2, "a", &["#1: bad".into()]);
        assert!(text.contains("Imported 2 accounts"));
        assert!(text.contains("1 failed"));
    }
}
