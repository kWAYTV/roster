//! `config/config.vdf`: the `Accounts` registry Steam keys by SteamID.

use std::fs;
use std::path::Path;

use crate::steam_config::loginusers::is_display_label;
use crate::vdf::{block_body_offset, block_range, byte_offset_of_line, quoted_fields};

/// Register `steamid` under the `Accounts` block; a no-op if already present.
/// Never writes a `user######` placeholder key — that poisons later lookups.
pub fn add_account(path: &Path, username: &str, steamid: &str) -> Result<(), String> {
    if !is_display_label(username) {
        return Ok(());
    }
    let content = fs::read_to_string(path).map_err(|_| "Failed to read config.vdf.")?;
    if let Some(existing) = account_name_in(&content, steamid) {
        if is_display_label(&existing) {
            return Ok(());
        }
        // Replace a leftover placeholder key with the real login.
        let stripped = strip_account(&content, steamid);
        let updated = insert_account(&stripped, username, steamid)?;
        return fs::write(path, updated).map_err(|_| "Failed to write config.vdf.".to_string());
    }
    let updated = insert_account(&content, username, steamid)?;
    fs::write(path, updated).map_err(|_| "Failed to write config.vdf.".to_string())
}

/// Steam login for `steamid` from the `Accounts` block key, when Steam already
/// knows the account. Prefers a real login over our `user######` placeholders.
pub fn account_name_for_steamid(path: &Path, steamid: &str) -> Result<Option<String>, String> {
    let content = fs::read_to_string(path).map_err(|_| "Failed to read config.vdf.")?;
    Ok(account_name_in(&content, steamid).filter(|name| is_display_label(name)))
}

/// Remove the account sub-block that carries `steamid`.
pub fn remove_account(path: &Path, steamid: &str) -> Result<(), String> {
    let content = fs::read_to_string(path).map_err(|_| "Failed to read config.vdf.")?;
    let stripped = strip_account(&content, steamid);
    fs::write(path, stripped).map_err(|_| "Failed to write config.vdf.".to_string())
}

fn insert_account(content: &str, username: &str, steamid: &str) -> Result<String, String> {
    if let Some(offset) = block_body_offset(content, "Accounts") {
        let mut out = content.to_string();
        out.insert_str(offset, &account_entry(username, steamid));
        return Ok(out);
    }

    let lines: Vec<&str> = content.lines().collect();
    let Some((_, close)) = block_range(&lines, "Steam") else {
        return Err("config.vdf is malformed; open Steam once to regenerate it.".to_string());
    };
    let at = byte_offset_of_line(&lines, close);
    let mut out = content.to_string();
    out.insert_str(at, &accounts_section(username, steamid));
    Ok(out)
}

fn strip_account(content: &str, steamid: &str) -> String {
    let lines: Vec<&str> = content.lines().collect();
    let range = block_range(&lines, "Accounts");
    let marker = steamid_marker(steamid);
    let mut out = String::new();
    let mut i = 0;

    while i < lines.len() {
        let Some((open, close)) = range else {
            push_line(&mut out, lines[i]);
            i += 1;
            continue;
        };
        if !(i > open && i < close) || quoted_fields(lines[i]).len() != 1 {
            push_line(&mut out, lines[i]);
            i += 1;
            continue;
        }
        let Some(end) = sub_block_end(&lines, i) else {
            push_line(&mut out, lines[i]);
            i += 1;
            continue;
        };
        if lines[i..=end].join("\n").contains(&marker) {
            i = end + 1;
            continue;
        }
        push_line(&mut out, lines[i]);
        i += 1;
    }

    out
}

fn push_line(out: &mut String, line: &str) {
    out.push_str(line);
    out.push('\n');
}

fn sub_block_end(lines: &[&str], key: usize) -> Option<usize> {
    let mut open = key + 1;
    while open < lines.len() && lines[open].trim().is_empty() {
        open += 1;
    }
    if open >= lines.len() || lines[open].trim() != "{" {
        return None;
    }
    let mut depth = 0_i32;
    for (i, line) in lines.iter().enumerate().skip(open) {
        let trimmed = line.trim();
        depth += trimmed.matches('{').count() as i32;
        depth -= trimmed.matches('}').count() as i32;
        if i > open && depth == 0 {
            return Some(i);
        }
    }
    None
}

fn steamid_marker(steamid: &str) -> String {
    format!("\"SteamID\"\t\t\"{steamid}\"")
}

/// Account block key whose `SteamID` field matches, preferring a real login.
fn account_name_in(content: &str, steamid: &str) -> Option<String> {
    let lines: Vec<&str> = content.lines().collect();
    let (open, close) = block_range(&lines, "Accounts")?;
    let marker = steamid_marker(steamid);
    let mut best: Option<String> = None;
    let mut i = open + 1;

    while i < close {
        let fields = quoted_fields(lines[i]);
        if fields.len() != 1 {
            i += 1;
            continue;
        }
        let Some(end) = sub_block_end(&lines, i) else {
            i += 1;
            continue;
        };
        if lines[i..=end].join("\n").contains(&marker) {
            let name = fields[0].clone();
            if is_display_label(&name) {
                return Some(name);
            }
            if best.is_none() {
                best = Some(name);
            }
        }
        i = end + 1;
    }

    best
}

fn account_entry(username: &str, steamid: &str) -> String {
    format!(
        "\n\t\t\t\t\t\"{username}\"\n\
         \t\t\t\t\t{{\n\
         \t\t\t\t\t\t\"SteamID\"\t\t\"{steamid}\"\n\
         \t\t\t\t\t}}\n"
    )
}

fn accounts_section(username: &str, steamid: &str) -> String {
    format!(
        "\t\t\t\"Accounts\"\n\
         \t\t\t{{\n\
         \t\t\t\t\"{username}\"\n\
         \t\t\t\t{{\n\
         \t\t\t\t\t\"SteamID\"\t\t\"{steamid}\"\n\
         \t\t\t\t}}\n\
         \t\t\t}}\n"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    const CONFIG: &str = "\"InstallConfigStore\"\n{\n\t\"Software\"\n\t{\n\t\t\"Valve\"\n\t\t{\n\t\t\t\"Steam\"\n\t\t\t{\n\t\t\t\t\"X\"\t\t\"1\"\n\t\t\t}\n\t\t}\n\t}\n}\n";

    #[test]
    fn creates_accounts_when_absent() {
        let out = insert_account(CONFIG, "player", "76561199843081825").unwrap();
        assert!(out.contains("\"Accounts\""));
        assert_eq!(
            account_name_in(&out, "76561199843081825").as_deref(),
            Some("player")
        );
    }

    #[test]
    fn removes_only_matching_account() {
        let with_two =
            insert_account(&insert_account(CONFIG, "a", "111").unwrap(), "b", "222").unwrap();
        let out = strip_account(&with_two, "111");
        assert!(account_name_in(&out, "111").is_none());
        assert_eq!(account_name_in(&out, "222").as_deref(), Some("b"));
    }

    #[test]
    fn finds_login_by_steamid() {
        let content = insert_account(CONFIG, "bill2003", "76561199725786495").unwrap();
        assert_eq!(
            account_name_in(&content, "76561199725786495").as_deref(),
            Some("bill2003")
        );
        assert!(account_name_in(&content, "999").is_none());
    }

    #[test]
    fn prefers_real_login_over_placeholder_key() {
        let poisoned = insert_account(CONFIG, "user786495", "76561199725786495").unwrap();
        let with_real = insert_account(&poisoned, "bill2003", "76561199725786495").unwrap();
        // Two keys can share a SteamID only in adversarial fixtures; prefer display label.
        assert_eq!(
            account_name_in(&with_real, "76561199725786495").as_deref(),
            Some("bill2003")
        );
    }
}
