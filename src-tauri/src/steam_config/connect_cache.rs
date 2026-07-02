//! `%LOCALAPPDATA%/Steam/local.vdf`: the DPAPI-encrypted refresh tokens.

use std::fs;
use std::path::Path;

use crate::secret::{encrypt_token, store_key};
use crate::vdf::quoted_fields;

/// Encrypt and store `token` for `username` inside `ConnectCache`.
pub fn store_token(cache_dir: &Path, username: &str, token: &str) -> Result<(), String> {
    let key = store_key(username);
    let encrypted = encrypt_token(token, username)?;
    let path = cache_dir.join("local.vdf");

    fs::create_dir_all(cache_dir).map_err(|_| "Failed to create the Steam cache directory.")?;

    let content = match fs::read_to_string(&path) {
        Ok(existing) => upsert_entry(&existing, &key, &encrypted)
            .unwrap_or_else(|| fresh_file(&key, &encrypted)),
        Err(_) => fresh_file(&key, &encrypted),
    };

    fs::write(&path, content).map_err(|_| "Failed to write local.vdf.".to_string())
}

/// Drop the cached token for `username`; a no-op if the file is missing.
pub fn remove_token(cache_dir: &Path, username: &str) {
    let path = cache_dir.join("local.vdf");
    let Ok(content) = fs::read_to_string(&path) else {
        return;
    };
    let key = store_key(username);
    let filtered: String = content
        .lines()
        .filter(|line| quoted_fields(line).first().map(String::as_str) != Some(key.as_str()))
        .map(|line| format!("{line}\n"))
        .collect();
    let _ = fs::write(&path, filtered);
}

/// Replace or append the key inside an existing `ConnectCache` block.
/// Returns `None` when the block is absent so the caller can rebuild the file.
fn upsert_entry(content: &str, key: &str, encrypted: &str) -> Option<String> {
    let mut out = String::new();
    let mut inside = false;
    let mut depth = 0_i32;
    let mut written = false;

    for line in content.lines() {
        let trimmed = line.trim();

        if trimmed == "\"ConnectCache\"" {
            inside = true;
            depth = 0;
            out.push_str(line);
            out.push('\n');
            continue;
        }

        if inside {
            if trimmed.starts_with('{') {
                depth += 1;
            } else if trimmed.starts_with('}') {
                depth -= 1;
                if depth == 0 && !written {
                    out.push_str(&entry_line(key, encrypted));
                    written = true;
                }
            } else if trimmed.starts_with(&format!("\"{key}\"")) {
                out.push_str(&entry_line(key, encrypted));
                written = true;
                continue;
            }
        }

        out.push_str(line);
        out.push('\n');
    }

    written.then_some(out)
}

fn entry_line(key: &str, encrypted: &str) -> String {
    format!("\t\t\t\t\t\"{key}\"\t\t\"{encrypted}\"\n")
}

fn fresh_file(key: &str, encrypted: &str) -> String {
    format!(
        "\"MachineUserConfigStore\"\n\
         {{\n\
         \t\"Software\"\n\
         \t{{\n\
         \t\t\"Valve\"\n\
         \t\t{{\n\
         \t\t\t\"Steam\"\n\
         \t\t\t{{\n\
         \t\t\t\t\"ConnectCache\"\n\
         \t\t\t\t{{\n\
         \t\t\t\t\t\"{key}\"\t\t\"{encrypted}\"\n\
         \t\t\t\t}}\n\
         \t\t\t}}\n\
         \t\t}}\n\
         \t}}\n\
         }}\n"
    )
}

#[cfg(test)]
mod tests {
    use super::{fresh_file, upsert_entry};

    #[test]
    fn replaces_existing_key() {
        let original = fresh_file("abc1", "old");
        let updated = upsert_entry(&original, "abc1", "new").unwrap();
        assert!(updated.contains("\"abc1\"\t\t\"new\""));
        assert!(!updated.contains("\"old\""));
    }

    #[test]
    fn adds_new_key_to_block() {
        let original = fresh_file("abc1", "one");
        let updated = upsert_entry(&original, "def1", "two").unwrap();
        assert!(updated.contains("\"abc1\""));
        assert!(updated.contains("\"def1\"\t\t\"two\""));
    }
}
