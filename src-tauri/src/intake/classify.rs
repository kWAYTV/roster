//! Split import text into importable vs expired entries, with new/update counts.

use std::collections::HashSet;

use super::{batch, jwt, parse};
use crate::roster;

/// Entries with a valid, unexpired Steam refresh token vs expired/invalid ones,
/// plus how many would create new accounts vs update existing ones.
pub fn classify(text: &str) -> ClassifyOutcome {
    let mut importable = Vec::new();
    let mut expired = Vec::new();

    for entry in batch::split(text) {
        let token = match parse::parse(&entry) {
            Ok((_, token)) => token,
            Err(_) => continue,
        };
        if jwt::is_importable(&token) {
            importable.push(entry);
        } else {
            expired.push(entry);
        }
    }

    let known = known_identities();
    let mut new_count = 0_usize;
    let mut update_count = 0_usize;
    for entry in &importable {
        let Ok((username, token)) = parse::parse(entry) else {
            continue;
        };
        let steamid = jwt::steamid(&token).unwrap_or_default();
        let exists = (!steamid.is_empty() && known.contains(&steamid.to_ascii_lowercase()))
            || known.contains(&username.to_ascii_lowercase());
        if exists {
            update_count += 1;
        } else {
            new_count += 1;
        }
    }

    ClassifyOutcome {
        importable,
        expired,
        new_count,
        update_count,
    }
}

pub struct ClassifyOutcome {
    pub importable: Vec<String>,
    pub expired: Vec<String>,
    pub new_count: usize,
    pub update_count: usize,
}

fn known_identities() -> HashSet<String> {
    let Ok(accounts) = roster::list_tray() else {
        return HashSet::new();
    };
    let mut known = HashSet::new();
    for account in accounts {
        if !account.steamid.is_empty() {
            known.insert(account.steamid.to_ascii_lowercase());
        }
        if !account.account_name.is_empty() {
            known.insert(account.account_name.to_ascii_lowercase());
        }
    }
    known
}
