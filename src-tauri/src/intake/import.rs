//! The import use case: parse entries, store tokens, optionally sign in the last one.

use std::path::Path;

use super::{batch, jwt, parse};
use crate::login::{self, SignInPrefs};
use crate::preferences;
use crate::steam_client::{cache_dir, install_dir, stop};
use crate::steam_config::{config_vdf, connect_cache, loginusers};

/// Import one or more accounts from pasted `text`.
///
/// When `import_without_sign_in` is set, tokens are stored only — Steam is left alone.
pub fn import_text(text: &str) -> Result<String, String> {
    let entries = batch::split(text);
    if entries.is_empty() {
        return Err("Nothing to import".to_string());
    }

    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    loginusers::require_config_files(&install.join("config"))?;
    let cache = cache_dir()?;

    let mut stored = 0usize;
    let mut failures: Vec<String> = Vec::new();
    let mut last: Option<(String, String)> = None;

    for (index, entry) in entries.iter().enumerate() {
        match store_entry(entry, &install, &cache) {
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

    let prefs = preferences::load();
    if prefs.import_without_sign_in {
        return Ok(summary_store_only(stored, &username, &failures));
    }

    stop()?;
    let sign_prefs = SignInPrefs::merge(&prefs, &Default::default(), false);
    login::activate(&username, &steamid, &install, &sign_prefs)?;
    login::relaunch(&install, &steamid, &sign_prefs)?;
    crate::metadata::mark_used(&steamid);
    Ok(summary(stored, &username, &failures))
}

/// Parse one entry and write its config + encrypted token to disk.
fn store_entry(entry: &str, install: &Path, cache: &Path) -> Result<(String, String), String> {
    let (username, token) = parse::parse(entry)?;
    if !jwt::is_importable(&token) {
        return Err("Token expired or invalid".to_string());
    }
    let steamid = jwt::steamid(&token)?;
    config_vdf::add_account(
        &install.join("config").join("config.vdf"),
        &username,
        &steamid,
    )?;
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
    fn summary_single_success() {
        assert_eq!(summary(1, "alice", &[]), "Imported alice");
    }

    #[test]
    fn summary_notes_failure_count() {
        let failures = vec!["#2: The username is empty.".to_string()];
        assert_eq!(summary(1, "alice", &failures), "Imported alice · 1 failed");
    }

    #[test]
    fn summary_multi_with_failures() {
        let failures: Vec<String> = (1..=4).map(|i| format!("#{i}: Bad entry.")).collect();
        assert_eq!(
            summary(2, "alice", &failures),
            "Imported 2 accounts · 4 failed"
        );
    }
}
