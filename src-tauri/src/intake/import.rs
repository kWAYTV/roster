//! The import use case: parse entries, store tokens, then sign in the last one.

use std::path::Path;

use super::{batch, jwt, parse};
use crate::login;
use crate::preferences;
use crate::steam_client::{cache_dir, install_dir, stop};
use crate::steam_config::{config_vdf, connect_cache, loginusers};

/// Import one or more accounts from pasted `text` and start Steam on the last.
pub fn import_text(text: &str) -> Result<String, String> {
    let entries = batch::split(text);
    if entries.is_empty() {
        return Err("Nothing to import.".to_string());
    }

    let _guard = crate::steam_client::mutation_guard();
    let install = install_dir()?;
    loginusers::require_config_files(&install.join("config"))?;
    let cache = cache_dir()?;
    stop()?;

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
    login::activate(&username, &steamid, &install, &prefs)?;
    login::relaunch(&install, &steamid, &prefs)?;
    crate::metadata::mark_used(&steamid);

    Ok(summary(stored, &username, &failures))
}

/// Parse one entry and write its config + encrypted token to disk.
fn store_entry(entry: &str, install: &Path, cache: &Path) -> Result<(String, String), String> {
    let (username, token) = parse::parse(entry)?;
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
    let mut message = if stored == 1 {
        format!("Imported {username}. Starting Steam.")
    } else {
        format!("Imported {stored} accounts. Starting Steam.")
    };
    if !failures.is_empty() {
        message.push_str(&format!(" {} failed: {}", failures.len(), detail(failures)));
    }
    message
}

/// The first couple of failure reasons, so the toast stays readable.
fn detail(failures: &[String]) -> String {
    const SHOWN: usize = 2;
    let mut text = failures[..failures.len().min(SHOWN)].join(" ");
    if failures.len() > SHOWN {
        text.push_str(&format!(" (+{} more)", failures.len() - SHOWN));
    }
    text
}

#[cfg(test)]
mod tests {
    use super::summary;

    #[test]
    fn summary_includes_failure_reasons() {
        let failures = vec!["#2: The username is empty.".to_string()];
        let message = summary(1, "alice", &failures);
        assert!(message.contains("1 failed: #2: The username is empty."));
    }

    #[test]
    fn summary_caps_failure_details() {
        let failures: Vec<String> = (1..=4).map(|i| format!("#{i}: Bad entry.")).collect();
        let message = summary(2, "alice", &failures);
        assert!(message.contains("4 failed:"));
        assert!(message.contains("(+2 more)"));
        assert!(!message.contains("#3"));
    }
}
