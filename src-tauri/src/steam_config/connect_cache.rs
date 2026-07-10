//! `%LOCALAPPDATA%/Steam/local.vdf`: the DPAPI-encrypted refresh tokens.

use std::fs;
use std::path::Path;

use crate::secret::{decrypt_token, encrypt_token, store_key};
use crate::vdf::{indent_of, quoted_fields};

/// Encrypt and store `token` for `username` inside `ConnectCache`.
pub fn store_token(cache_dir: &Path, username: &str, token: &str) -> Result<(), String> {
    let key = store_key(username);
    let encrypted = encrypt_token(token, username)?;
    let path = cache_dir.join("local.vdf");

    fs::create_dir_all(cache_dir).map_err(|_| "Failed to create the Steam cache directory.")?;

    // Never rebuild an existing file from scratch: that would silently drop
    // every other account's cached token. If the layout is unrecognizable,
    // fail and leave the file untouched.
    let content = match fs::read_to_string(&path) {
        Ok(existing) => upsert_entry(&existing, &key, &encrypted)
            .or_else(|| insert_cache_block(&existing, &key, &encrypted))
            .ok_or_else(|| "local.vdf has an unexpected layout; not overwriting it.".to_string())?,
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
        .fold(String::new(), |mut out, line| {
            out.push_str(line);
            out.push('\n');
            out
        });
    let _ = fs::write(&path, filtered);
}

/// Read and decrypt the cached refresh token for `username`, if present.
pub fn read_token(cache_dir: &Path, username: &str) -> Option<String> {
    let encrypted = read_encrypted(cache_dir, username)?;
    decrypt_token(&encrypted, username).ok()
}

fn read_encrypted(cache_dir: &Path, username: &str) -> Option<String> {
    let path = cache_dir.join("local.vdf");
    let content = fs::read_to_string(&path).ok()?;
    let key = store_key(username);
    for line in content.lines() {
        let fields = quoted_fields(line);
        if fields.len() >= 2 && fields[0] == key {
            return Some(fields[1].clone());
        }
    }
    None
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

/// Add a `ConnectCache` block (with one entry) inside an existing `Steam`
/// block. Returns `None` when no `Steam` block is found either.
fn insert_cache_block(content: &str, key: &str, encrypted: &str) -> Option<String> {
    let mut out = String::new();
    let mut after_steam_header = false;
    let mut inserted = false;

    for line in content.lines() {
        out.push_str(line);
        out.push('\n');

        let trimmed = line.trim();
        if after_steam_header {
            after_steam_header = false;
            if !inserted && trimmed.starts_with('{') {
                let indent = format!("{}\t", indent_of(line));
                out.push_str(&format!(
                    "{indent}\"ConnectCache\"\n{indent}{{\n{indent}\t\"{key}\"\t\t\"{encrypted}\"\n{indent}}}\n"
                ));
                inserted = true;
            }
        } else if trimmed == "\"Steam\"" {
            after_steam_header = true;
        }
    }

    inserted.then_some(out)
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
    use super::{fresh_file, insert_cache_block, upsert_entry};

    #[test]
    fn inserts_block_when_missing() {
        let without_cache = "\"MachineUserConfigStore\"\n{\n\t\"Software\"\n\t{\n\t\t\"Valve\"\n\t\t{\n\t\t\t\"Steam\"\n\t\t\t{\n\t\t\t\t\"SomeOtherKey\"\t\t\"kept\"\n\t\t\t}\n\t\t}\n\t}\n}\n";
        let updated = insert_cache_block(without_cache, "abc1", "enc").unwrap();
        assert!(updated.contains("\"ConnectCache\""));
        assert!(updated.contains("\"abc1\"\t\t\"enc\""));
        assert!(updated.contains("\"SomeOtherKey\"\t\t\"kept\""));
        // The inserted block is inside the Steam block and parses back out.
        assert!(upsert_entry(&updated, "abc1", "enc2").is_some());
    }

    #[test]
    fn refuses_unrecognizable_layout() {
        assert!(insert_cache_block("not a vdf file at all", "abc1", "enc").is_none());
    }

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
