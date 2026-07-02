//! Split a paste containing several accounts into individual entries.

use super::jwt;

/// Break `content` into entries by blank-line paragraphs, then by lines that
/// carry their own token, falling back to the whole paste as one entry.
pub fn split(content: &str) -> Vec<String> {
    let cleaned = sanitize(content);
    let trimmed = cleaned.trim();
    if trimmed.is_empty() {
        return Vec::new();
    }

    let paragraphs = non_empty(trimmed.split("\n\n"));
    if paragraphs.len() > 1 {
        return paragraphs;
    }

    let lines: Vec<String> = trimmed
        .lines()
        .map(str::trim)
        .filter(|line| is_entry_line(line))
        .map(String::from)
        .collect();
    if lines.len() > 1 {
        return lines;
    }

    vec![trimmed.to_string()]
}

/// A line counts as its own entry when it carries a token, whether prefixed
/// with `steamid----`, `username----`, or standing alone.
fn is_entry_line(line: &str) -> bool {
    jwt::find(line).is_some()
}

fn non_empty<'a>(parts: impl Iterator<Item = &'a str>) -> Vec<String> {
    parts
        .map(str::trim)
        .filter(|chunk| !chunk.is_empty())
        .map(String::from)
        .collect()
}

/// Strip zero-width and BOM characters and normalize non-breaking spaces.
fn sanitize(input: &str) -> String {
    input
        .replace(['\u{feff}', '\u{200b}'], "")
        .replace('\u{00a0}', " ")
}

#[cfg(test)]
mod tests {
    use super::split;

    const TOKEN: &str =
        "eyJ0eXAiOiJKV1QifQ.eyJzdWIiOiI3NjU2MTE5OTg0MzA4MTgyNSIsIm5hbWUiOiJwbGF5ZXIifQ.AAAA";

    #[test]
    fn splits_multiple_lines() {
        let input = format!("76561199843081825----{TOKEN}\n76561199194545602----{TOKEN}");
        assert_eq!(split(&input).len(), 2);
    }

    #[test]
    fn splits_username_delimited_lines() {
        let input = format!("alice----{TOKEN}\nbob----{TOKEN}");
        assert_eq!(split(&input).len(), 2);
    }

    #[test]
    fn splits_bare_token_lines() {
        let input = format!("{TOKEN}\n{TOKEN}");
        assert_eq!(split(&input).len(), 2);
    }

    #[test]
    fn keeps_single_entry_whole() {
        assert_eq!(split(TOKEN).len(), 1);
    }

    #[test]
    fn ignores_blank_input() {
        assert!(split("   \n  ").is_empty());
    }
}
