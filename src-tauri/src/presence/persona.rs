//! Set the online state Steam shows on sign-in (Invisible vs Online).

use crate::vdf::{block_body_offset, indent_of, insert_before_last_brace};

// ePersonaState values Steam understands: 7 = Invisible, 1 = Online.
const INVISIBLE: u8 = 7;
const ONLINE: u8 = 1;

/// Write the per-account persona preference into `WebStorage`, creating the
/// key or block as needed. The value is a JSON string with escaped quotes,
/// exactly as Steam stores it.
pub fn apply(content: &str, steamid3: &str, invisible: bool) -> String {
    let state = if invisible { INVISIBLE } else { ONLINE };
    let key = format!("FriendStoreLocalPrefs_{steamid3}");
    let json = format!(r#"{{\"ePersonaState\":{state},\"strNonFriendsAllowedToMsg\":\"\"}}"#);

    if content.contains(&key) {
        return replace_pref(content, &key, &json);
    }

    let entry = format!("\t\t\"{key}\"\t\t\"{json}\"\n");
    if let Some(offset) = block_body_offset(content, "WebStorage") {
        let mut out = content.to_string();
        out.insert_str(offset, &entry);
        return out;
    }

    insert_before_last_brace(content, &format!("\t\"WebStorage\"\n\t{{\n{entry}\t}}\n"))
}

/// Replace the pref line by key match, since its JSON value defeats the plain
/// quoted-field parser.
fn replace_pref(content: &str, key: &str, json: &str) -> String {
    content
        .lines()
        .map(|line| {
            if line.contains(key) {
                format!("{}\"{key}\"\t\t\"{json}\"\n", indent_of(line))
            } else {
                format!("{line}\n")
            }
        })
        .collect()
}
