//! Turn one pasted entry into a `(username, token)` pair.

use super::jwt;

/// Parse a single account entry in any of the supported shapes:
/// `steamid----token`, `username----token` (optionally with trailing
/// metadata), or a bare token.
pub fn parse(entry: &str) -> Result<(String, String), String> {
    let text = entry.trim();
    if text.is_empty() {
        return Err("Nothing to import.".to_string());
    }

    if let Some((label, token)) = split_delimited(text) {
        let username = if is_steamid(&label) {
            label
        } else {
            ensure_username(&label)?;
            label
        };
        return Ok((username, token));
    }

    if let Some(token) = jwt::find(text) {
        let steamid = jwt::steamid(&token)?;
        let username = jwt::username(&token, &steamid)?;
        return Ok((username, token));
    }

    Err("Unrecognized format. Paste `steamid----token`, `username----token`, or the token on its own.".to_string())
}

/// Whether a value looks like a SteamID64.
pub(super) fn is_steamid(value: &str) -> bool {
    let value = value.trim();
    (15..=20).contains(&value.len()) && value.chars().all(|c| c.is_ascii_digit())
}

/// Split `label----token`, tolerating trailing `----metadata` segments.
fn split_delimited(text: &str) -> Option<(String, String)> {
    let pos = text.find("----")?;
    let label = strip_quotes(&text[..pos]);
    if label.is_empty() {
        return None;
    }
    let token = jwt::find(&text[pos + 4..])?;
    Some((label, token))
}

/// Reject account names that would corrupt the VDF files we write.
fn ensure_username(value: &str) -> Result<(), String> {
    if value.is_empty() {
        return Err("The username is empty.".to_string());
    }
    if value
        .chars()
        .any(|c| matches!(c, '"' | '\\' | '{' | '}' | '\n' | '\r' | '\t'))
    {
        return Err("The username contains invalid characters.".to_string());
    }
    Ok(())
}

fn strip_quotes(value: &str) -> String {
    value
        .trim()
        .trim_matches(|c| c == '"' || c == '\'' || c == '`')
        .trim()
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    const TOKEN: &str =
        "eyJ0eXAiOiJKV1QifQ.eyJzdWIiOiI3NjU2MTE5OTg0MzA4MTgyNSIsIm5hbWUiOiJwbGF5ZXIifQ.AAAA";

    #[test]
    fn parses_steamid_delimited() {
        let (user, token) = parse(&format!("76561199843081825----{TOKEN}")).unwrap();
        assert_eq!(user, "76561199843081825");
        assert_eq!(token, TOKEN);
    }

    #[test]
    fn parses_username_delimited() {
        let (user, token) = parse(&format!("coolname----{TOKEN}")).unwrap();
        assert_eq!(user, "coolname");
        assert_eq!(token, TOKEN);
    }

    #[test]
    fn ignores_trailing_metadata() {
        let (user, _) = parse(&format!("76561199843081825----{TOKEN}----rank:13----vac:clean")).unwrap();
        assert_eq!(user, "76561199843081825");
    }

    #[test]
    fn parses_bare_token() {
        let (user, token) = parse(TOKEN).unwrap();
        assert_eq!(user, "player");
        assert_eq!(token, TOKEN);
    }
}
