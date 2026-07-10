//! Split import text into importable vs expired entries.

use super::{batch, jwt, parse};

/// Entries with a valid, unexpired Steam refresh token vs expired/invalid ones.
pub fn classify(text: &str) -> (Vec<String>, Vec<String>) {
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

    (importable, expired)
}
