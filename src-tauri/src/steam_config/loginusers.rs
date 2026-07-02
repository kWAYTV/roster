//! `config/loginusers.vdf`: the list of remembered logins.

use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::vdf::{insert_before_last_brace, quoted_fields};

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
    content = content.replace("\"MostRecent\"\t\t\"1\"", "\"MostRecent\"\t\t\"0\"");

    content = if content.contains(&format!("\"{steamid}\"")) {
        refresh_block(&content, username, steamid)
    } else {
        insert_before_last_brace(&content, &new_block(username, steamid))
    };

    fs::write(path, content).map_err(|_| "Failed to write loginusers.vdf.".to_string())
}

/// Drop the block for `steamid`; a no-op if it is already absent.
pub fn remove(path: &Path, steamid: &str) -> Result<(), String> {
    let content = fs::read_to_string(path).map_err(|_| "Failed to read loginusers.vdf.")?;
    let stripped = strip_block(&content, steamid);
    fs::write(path, stripped).map_err(|_| "Failed to write loginusers.vdf.".to_string())
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
        if line.contains("\"AccountName\"") {
            body.push(format!("\t\t\"AccountName\"\t\t\"{username}\"\n"));
        } else if line.contains("\"MostRecent\"") {
            body.push("\t\t\"MostRecent\"\t\t\"1\"\n".to_string());
        } else if line.contains("\"Timestamp\"") {
            body.push(format!("\t\t\"Timestamp\"\t\t\"{}\"\n", now()));
        } else if line.contains("\"RememberPassword\"") {
            seen_remember = true;
            body.push("\t\t\"RememberPassword\"\t\t\"1\"\n".to_string());
        } else if line.contains("\"AllowAutoLogin\"") {
            seen_autologin = true;
            body.push("\t\t\"AllowAutoLogin\"\t\t\"1\"\n".to_string());
        } else {
            body.push(format!("{line}\n"));
        }
        if closing {
            break;
        }
    }

    if let Some(closing) = body.pop() {
        if !seen_remember {
            body.push("\t\t\"RememberPassword\"\t\t\"1\"\n".to_string());
        }
        if !seen_autologin {
            body.push("\t\t\"AllowAutoLogin\"\t\t\"1\"\n".to_string());
        }
        body.push(closing);
    }

    for line in body {
        out.push_str(&line);
    }
}

fn strip_block(content: &str, steamid: &str) -> String {
    let lines: Vec<&str> = content.lines().collect();
    let mut out = String::new();
    let mut i = 0;

    while i < lines.len() {
        if is_header(lines[i], steamid) {
            if let Some(end) = block_end(&lines, i) {
                i = end + 1;
                continue;
            }
        }
        out.push_str(lines[i]);
        out.push('\n');
        i += 1;
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

fn new_block(username: &str, steamid: &str) -> String {
    let ts = now();
    format!(
        "\t\"{steamid}\"\n\t{{\n\
         \t\t\"AccountName\"\t\t\"{username}\"\n\
         \t\t\"PersonaName\"\t\t\"{username}\"\n\
         \t\t\"RememberPassword\"\t\t\"1\"\n\
         \t\t\"WantsOfflineMode\"\t\t\"0\"\n\
         \t\t\"SkipOfflineModeWarning\"\t\t\"0\"\n\
         \t\t\"AllowAutoLogin\"\t\t\"1\"\n\
         \t\t\"MostRecent\"\t\t\"1\"\n\
         \t\t\"Timestamp\"\t\t\"{ts}\"\n\
         \t}}\n"
    )
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
    use super::{new_block, strip_block};

    #[test]
    fn strips_target_block_only() {
        let content = format!(
            "\"users\"\n{{\n{}{}}}\n",
            new_block("a", "111"),
            new_block("b", "222")
        );
        let out = strip_block(&content, "111");
        assert!(!out.contains("\"111\""));
        assert!(out.contains("\"222\""));
    }
}
