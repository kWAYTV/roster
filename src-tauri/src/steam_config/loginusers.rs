//! `config/loginusers.vdf`: the list of remembered logins.

use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::vdf::{indent_of, insert_before_last_brace, quoted_fields};

/// One remembered login block, enough for handoff and import wiring.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LoginEntry {
    pub steamid: String,
    pub account_name: String,
    pub timestamp: u64,
    pub most_recent: bool,
}

/// Fail early if Steam has never created its config files.
pub fn require_config_files(config_dir: &Path) -> Result<(), String> {
    let has_config = config_dir.join("config.vdf").exists();
    let has_logins = config_dir.join("loginusers.vdf").exists();
    if has_config && has_logins {
        Ok(())
    } else {
        Err("Open Steam and sign in once so it can create its config files.".to_string())
    }
}

/// Make `steamid` the most-recent login: demote everyone else, then either
/// refresh the existing block or append a new one.
pub fn set_active(path: &Path, username: &str, steamid: &str) -> Result<(), String> {
    let mut content = fs::read_to_string(path).map_err(|_| "Failed to read loginusers.vdf.")?;
    content = demote_most_recent(&content);

    content = if content.contains(&format!("\"{steamid}\"")) {
        refresh_block(&content, username, steamid)
    } else {
        insert_before_last_brace(&content, &new_block(username, steamid, true))
    };

    fs::write(path, content).map_err(|_| "Failed to write loginusers.vdf.".to_string())
}

/// Ensure `steamid` has a loginusers block without making it MostRecent.
/// Used by multi-import so every stored account is visible in the roster.
pub fn ensure_present(path: &Path, username: &str, steamid: &str) -> Result<(), String> {
    let content = fs::read_to_string(path).map_err(|_| "Failed to read loginusers.vdf.")?;
    if entry_for(&content, steamid).is_some() {
        return Ok(());
    }
    let updated = insert_before_last_brace(&content, &new_block(username, steamid, false));
    fs::write(path, updated).map_err(|_| "Failed to write loginusers.vdf.".to_string())
}

/// Drop the block for `steamid`; a no-op if it is already absent.
pub fn remove(path: &Path, steamid: &str) -> Result<(), String> {
    let content = fs::read_to_string(path).map_err(|_| "Failed to read loginusers.vdf.")?;
    let stripped = strip_block(&content, steamid);
    fs::write(path, stripped).map_err(|_| "Failed to write loginusers.vdf.".to_string())
}

/// AccountName for `steamid` when a block already exists.
pub fn account_name_for(path: &Path, steamid: &str) -> Result<Option<String>, String> {
    let content = fs::read_to_string(path).map_err(|_| "Failed to read loginusers.vdf.")?;
    Ok(entry_for(&content, steamid).map(|entry| entry.account_name))
}

/// Demote every MostRecent=1 field, tolerant of space vs tab separators.
fn demote_most_recent(content: &str) -> String {
    let mut out = String::new();
    for line in content.lines() {
        let fields = quoted_fields(line);
        if fields.len() >= 2 && fields[0] == "MostRecent" && fields[1] == "1" {
            let indent = indent_of(line);
            out.push_str(&format!("{indent}\"MostRecent\"\t\t\"0\"\n"));
        } else {
            out.push_str(line);
            out.push('\n');
        }
    }
    out
}

/// Rewrite the fields inside the `steamid` block for an active login.
fn refresh_block(content: &str, username: &str, steamid: &str) -> String {
    let mut out = String::new();
    let mut lines = content.lines();

    while let Some(line) = lines.next() {
        out.push_str(line);
        out.push('\n');
        if is_header(line, steamid) {
            rewrite_body(&mut out, &mut lines, username);
        }
    }

    out
}

/// Consume `{ ... }` following a header, emitting the login-ready fields.
fn rewrite_body<'a>(out: &mut String, lines: &mut impl Iterator<Item = &'a str>, username: &str) {
    let mut seen_remember = false;
    let mut seen_autologin = false;
    let mut body: Vec<String> = Vec::new();

    for line in lines.by_ref() {
        let closing = line.trim() == "}";
        body.push(rewrite_field(
            line,
            username,
            &mut seen_remember,
            &mut seen_autologin,
        ));
        if closing {
            break;
        }
    }

    let Some(closing) = body.pop() else {
        return;
    };
    if !seen_remember {
        body.push("\t\t\"RememberPassword\"\t\t\"1\"\n".to_string());
    }
    if !seen_autologin {
        body.push("\t\t\"AllowAutoLogin\"\t\t\"1\"\n".to_string());
    }
    body.push(closing);

    for line in body {
        out.push_str(&line);
    }
}

fn rewrite_field(
    line: &str,
    username: &str,
    seen_remember: &mut bool,
    seen_autologin: &mut bool,
) -> String {
    let fields = quoted_fields(line);
    if fields.len() >= 2 {
        return match fields[0].as_str() {
            "AccountName" => {
                // Never replace a real Steam account name with a SteamID / placeholder.
                if should_preserve_account_name(&fields[1], username) {
                    format!("{line}\n")
                } else {
                    format!("\t\t\"AccountName\"\t\t\"{username}\"\n")
                }
            }
            "MostRecent" => "\t\t\"MostRecent\"\t\t\"1\"\n".to_string(),
            "Timestamp" => format!("\t\t\"Timestamp\"\t\t\"{}\"\n", now()),
            "RememberPassword" => {
                *seen_remember = true;
                "\t\t\"RememberPassword\"\t\t\"1\"\n".to_string()
            }
            "AllowAutoLogin" => {
                *seen_autologin = true;
                "\t\t\"AllowAutoLogin\"\t\t\"1\"\n".to_string()
            }
            _ => format!("{line}\n"),
        };
    }
    format!("{line}\n")
}

fn should_preserve_account_name(existing: &str, incoming: &str) -> bool {
    !existing.is_empty()
        && !looks_like_steamid(existing)
        && !is_generated_username(existing)
        && (looks_like_steamid(incoming) || is_generated_username(incoming))
}

/// `jwt::username` fallback shape: `user` + last 6 SteamID digits.
fn is_generated_username(value: &str) -> bool {
    value.len() == 10
        && value.starts_with("user")
        && value.as_bytes()[4..].iter().all(u8::is_ascii_digit)
}

fn strip_block(content: &str, steamid: &str) -> String {
    let lines: Vec<&str> = content.lines().collect();
    let mut out = String::new();
    let mut i = 0;

    while i < lines.len() {
        if !is_header(lines[i], steamid) {
            out.push_str(lines[i]);
            out.push('\n');
            i += 1;
            continue;
        }
        let Some(end) = block_end(&lines, i) else {
            out.push_str(lines[i]);
            out.push('\n');
            i += 1;
            continue;
        };
        i = end + 1;
    }

    out
}

/// Index of the `}` that closes the block whose header is at `header`.
fn block_end(lines: &[&str], header: usize) -> Option<usize> {
    let mut open = header + 1;
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

fn is_header(line: &str, steamid: &str) -> bool {
    let fields = quoted_fields(line);
    fields.len() == 1 && fields[0] == steamid
}

fn entry_for(content: &str, steamid: &str) -> Option<LoginEntry> {
    list_entries(content)
        .into_iter()
        .find(|entry| entry.steamid == steamid)
}

fn list_entries(content: &str) -> Vec<LoginEntry> {
    let mut entries = Vec::new();
    let mut current: Option<LoginEntry> = None;

    for line in content.lines() {
        let fields = quoted_fields(line);

        if fields.len() == 1 && looks_like_steamid(&fields[0]) {
            current = Some(LoginEntry {
                steamid: fields[0].clone(),
                account_name: String::new(),
                timestamp: 0,
                most_recent: false,
            });
            continue;
        }

        if line.trim() == "}" {
            if let Some(entry) = current.take() {
                if !entry.steamid.is_empty() {
                    entries.push(entry);
                }
            }
            continue;
        }

        let Some(entry) = current.as_mut() else {
            continue;
        };
        if fields.len() != 2 {
            continue;
        }
        match fields[0].as_str() {
            "AccountName" => entry.account_name = fields[1].clone(),
            "Timestamp" => entry.timestamp = fields[1].parse().unwrap_or(0),
            "MostRecent" => entry.most_recent = fields[1] == "1",
            _ => {}
        }
    }

    entries
}

fn new_block(username: &str, steamid: &str, most_recent: bool) -> String {
    let ts = now();
    let recent = if most_recent { "1" } else { "0" };
    format!(
        "\t\"{steamid}\"\n\t{{\n\
         \t\t\"AccountName\"\t\t\"{username}\"\n\
         \t\t\"PersonaName\"\t\t\"{username}\"\n\
         \t\t\"RememberPassword\"\t\t\"1\"\n\
         \t\t\"WantsOfflineMode\"\t\t\"0\"\n\
         \t\t\"SkipOfflineModeWarning\"\t\t\"0\"\n\
         \t\t\"AllowAutoLogin\"\t\t\"1\"\n\
         \t\t\"MostRecent\"\t\t\"{recent}\"\n\
         \t\t\"Timestamp\"\t\t\"{ts}\"\n\
         \t}}\n"
    )
}

fn looks_like_steamid(value: &str) -> bool {
    let value = value.trim();
    (15..=20).contains(&value.len()) && value.chars().all(|c| c.is_ascii_digit())
}

fn now() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::{
        demote_most_recent, entry_for, is_generated_username, list_entries, new_block,
        should_preserve_account_name, strip_block,
    };

    #[test]
    fn strips_target_block_only() {
        let content = format!(
            "\"users\"\n{{\n{}{}}}\n",
            new_block("a", "11111111111111111", true),
            new_block("b", "22222222222222222", false)
        );
        let out = strip_block(&content, "11111111111111111");
        assert!(!out.contains("\"11111111111111111\""));
        assert!(out.contains("\"22222222222222222\""));
    }

    #[test]
    fn demotes_space_separated_most_recent() {
        let content =
            "\"users\"\n{\n\t\"76561199843081825\"\n\t{\n\t\t\"MostRecent\" \"1\"\n\t}\n}\n";
        let out = demote_most_recent(content);
        assert!(out.contains("\"MostRecent\"\t\t\"0\""));
        assert!(!out.contains("\"MostRecent\" \"1\""));
    }

    #[test]
    fn lists_entries_with_timestamp() {
        let content = "\"users\"\n{\n\t\"76561199843081825\"\n\t{\n\t\t\"AccountName\"\t\t\"alpha\"\n\t\t\"Timestamp\"\t\t\"100\"\n\t\t\"MostRecent\"\t\t\"1\"\n\t}\n}\n";
        let entries = list_entries(content);
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].account_name, "alpha");
        assert_eq!(entries[0].timestamp, 100);
        assert!(entries[0].most_recent);
        assert!(entry_for(content, "76561199843081825").is_some());
    }

    #[test]
    fn preserves_real_account_name_against_placeholder() {
        assert!(should_preserve_account_name(
            "coolname",
            "76561199843081825"
        ));
        assert!(should_preserve_account_name("coolname", "user081825"));
        assert!(!should_preserve_account_name(
            "76561199843081825",
            "coolname"
        ));
        assert!(!should_preserve_account_name("user081825", "coolname"));
        assert!(!should_preserve_account_name("", "coolname"));
        assert!(is_generated_username("user081825"));
        assert!(!is_generated_username("userfoo"));
    }
}
