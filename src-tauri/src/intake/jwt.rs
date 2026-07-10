//! Steam refresh tokens are JWTs; here we find, validate, and read them.

use base64::engine::general_purpose::{STANDARD, URL_SAFE, URL_SAFE_NO_PAD};
use base64::Engine;

/// The SteamID64 carried in the token's `sub` claim.
pub fn steamid(jwt: &str) -> Result<String, String> {
    let claims = claims(jwt)?;
    let sub = claims
        .get("sub")
        .and_then(|v| v.as_str())
        .ok_or("The token is missing its SteamID.")?;
    if sub.parse::<u64>().is_err() {
        return Err("The token's SteamID is not numeric.".to_string());
    }
    Ok(sub.to_string())
}

/// A usable account name derived from the token, falling back to `userNNNNNN`.
pub fn username(jwt: &str, steamid: &str) -> Result<String, String> {
    let claims = claims(jwt)?;
    for key in ["preferred_username", "name", "unique_name"] {
        if let Some(value) = claims.get(key).and_then(|v| v.as_str()) {
            let candidate = trim_wrapping(value);
            if !candidate.is_empty() && candidate != steamid {
                return Ok(candidate);
            }
        }
    }
    let tail = &steamid[steamid.len().saturating_sub(6)..];
    Ok(format!("user{tail}"))
}

/// Find the first JWT-looking token inside arbitrary text.
pub fn find(text: &str) -> Option<String> {
    let compact = compact(text);
    if is_jwt(&compact) {
        return Some(compact);
    }
    for (start, _) in compact.match_indices("ey") {
        if let Some(token) = slice_parts(&compact[start..]) {
            return Some(token);
        }
    }
    None
}

/// Seconds until `exp`, or `-1` when missing, invalid, or already expired.
pub fn expires_in(jwt: &str) -> i64 {
    let Some(exp) = expires_at(jwt) else {
        return -1;
    };
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    let remaining = exp as i64 - now;
    if remaining > 0 {
        remaining
    } else {
        -1
    }
}

/// Whether the token looks like a valid, unexpired Steam refresh JWT.
pub fn is_importable(jwt: &str) -> bool {
    is_steam_refresh(jwt) && expires_in(jwt) >= 0
}

/// Unix seconds from the `exp` claim, if present.
pub fn expires_at(jwt: &str) -> Option<u64> {
    let claims = claims(jwt).ok()?;
    claims.get("exp").and_then(|v| v.as_u64())
}

fn is_steam_refresh(jwt: &str) -> bool {
    let Ok(claims) = claims(jwt) else {
        return false;
    };
    if claims.get("iss").and_then(|v| v.as_str()) != Some("steam") {
        return false;
    }
    claims
        .get("aud")
        .and_then(|v| v.as_str())
        .is_some_and(|aud| aud.contains("client"))
}

/// Whether `token` has the three dot-separated JWT segments.
pub fn is_jwt(token: &str) -> bool {
    let parts: Vec<&str> = token.split('.').collect();
    parts.len() == 3
        && parts[0].starts_with("ey")
        && parts
            .iter()
            .all(|p| !p.is_empty() && p.chars().all(is_token_char))
}

fn claims(jwt: &str) -> Result<serde_json::Value, String> {
    let token = compact(jwt);
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err("The token format is invalid.".to_string());
    }
    let payload = URL_SAFE_NO_PAD
        .decode(parts[1])
        .or_else(|_| URL_SAFE.decode(parts[1]))
        .or_else(|_| STANDARD.decode(parts[1]))
        .map_err(|_| "The token payload could not be decoded.".to_string())?;
    serde_json::from_slice(&payload).map_err(|_| "The token payload is not valid JSON.".to_string())
}

/// Carve a three-part JWT out of the start of `s`, stopping at the first
/// non-token character in the signature.
fn slice_parts(s: &str) -> Option<String> {
    let first = s.find('.')?;
    let second = s[first + 1..].find('.')? + first + 1;
    let rest = &s[second + 1..];
    // `----` is the account/metadata delimiter, never part of a signature.
    let bounded = &rest[..rest.find("----").unwrap_or(rest.len())];
    let sig = bounded
        .find(|c: char| !is_token_char(c))
        .unwrap_or(bounded.len());
    let token = format!(
        "{}.{}.{}",
        &s[..first],
        &s[first + 1..second],
        &bounded[..sig]
    );
    is_jwt(&token).then_some(token)
}

/// Strip whitespace and wrapping quotes, since pasted tokens are often padded.
fn compact(value: &str) -> String {
    trim_wrapping(value).split_whitespace().collect()
}

fn trim_wrapping(value: &str) -> String {
    value
        .trim()
        .trim_matches(|c| c == '"' || c == '\'' || c == '`')
        .trim()
        .to_string()
}

fn is_token_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || matches!(c, '_' | '-' | '=')
}

#[cfg(test)]
mod tests {
    use super::*;

    // Header/payload/signature; payload decodes to {"sub":"76561199843081825",...}.
    const TOKEN: &str =
        "eyJ0eXAiOiJKV1QifQ.eyJzdWIiOiI3NjU2MTE5OTg0MzA4MTgyNSIsIm5hbWUiOiJwbGF5ZXIifQ.AAAA";

    #[test]
    fn recognizes_jwt_shape() {
        assert!(is_jwt(TOKEN));
        assert!(!is_jwt("not.a.jwt token"));
    }

    #[test]
    fn reads_steamid_from_sub() {
        assert_eq!(steamid(TOKEN).unwrap(), "76561199843081825");
    }

    #[test]
    fn prefers_name_claim_for_username() {
        assert_eq!(username(TOKEN, "76561199843081825").unwrap(), "player");
    }

    #[test]
    fn finds_token_inside_noise() {
        let noisy = format!("junk {TOKEN} ---- extra:1");
        assert_eq!(find(&noisy).unwrap(), TOKEN);
    }

    #[test]
    fn finds_token_with_internal_whitespace() {
        let spaced = TOKEN.replace("ey", "ey ");
        assert_eq!(find(&spaced).unwrap(), TOKEN);
    }

    #[test]
    fn expires_in_negative_for_garbage() {
        assert_eq!(expires_in("not.a.jwt"), -1);
    }
}
