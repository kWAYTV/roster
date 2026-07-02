//! `config/config.vdf`: the `Accounts` registry Steam keys by SteamID.

use std::fs;
use std::path::Path;

use crate::vdf::{block_body_offset, block_range, byte_offset_of_line, quoted_fields};

/// Register `steamid` under the `Accounts` block; a no-op if already present.
pub fn add_account(path: &Path, username: &str, steamid: &str) -> Result<(), String> {
    let content = fs::read_to_string(path).map_err(|_| "Failed to read config.vdf.")?;
    if contains_steamid(&content, steamid) {
        return Ok(());
    }
    let updated = insert_account(&content, username, steamid)?;
    fs::write(path, updated).map_err(|_| "Failed to write config.vdf.".to_string())
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
    let (_, close) = block_range(&lines, "Steam")
        .ok_or("config.vdf is malformed; open Steam once to regenerate it.")?;
    let at = byte_offset_of_line(&lines, close);
    let mut out = content.to_string();
    out.insert_str(at, &accounts_section(username, steamid));
    Ok(out)
}

fn strip_account(content: &str, steamid: &str) -> String {
    let lines: Vec<&str> = content.lines().collect();
    let range = block_range(&lines, "Accounts");
    let mut out = String::new();
    let mut i = 0;

    while i < lines.len() {
        if let Some((open, close)) = range {
            if i > open && i < close && quoted_fields(lines[i]).len() == 1 {
                if let Some(end) = sub_block_end(&lines, i) {
                    if lines[i..=end].join("\n").contains(&steamid_marker(steamid)) {
                        i = end + 1;
                        continue;
                    }
                }
            }
        }
        out.push_str(lines[i]);
        out.push('\n');
        i += 1;
    }

    out
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

fn contains_steamid(content: &str, steamid: &str) -> bool {
    content.contains(&steamid_marker(steamid))
}

fn steamid_marker(steamid: &str) -> String {
    format!("\"SteamID\"\t\t\"{steamid}\"")
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
        assert!(contains_steamid(&out, "76561199843081825"));
    }

    #[test]
    fn removes_only_matching_account() {
        let with_two = insert_account(
            &insert_account(CONFIG, "a", "111").unwrap(),
            "b",
            "222",
        )
        .unwrap();
        let out = strip_account(&with_two, "111");
        assert!(!contains_steamid(&out, "111"));
        assert!(contains_steamid(&out, "222"));
    }
}
