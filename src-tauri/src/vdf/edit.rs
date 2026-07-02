use super::query::indent_of;
use super::tokens::quoted_fields;

/// Replace the value of an existing `"key" "value"` line, preserving indent.
/// When the key is absent, append it just before the final closing brace.
pub fn replace_key_line(content: &str, key: &str, value: &str) -> String {
    let mut out = String::new();
    let mut replaced = false;

    for line in content.lines() {
        let fields = quoted_fields(line);
        if fields.len() >= 2 && fields[0] == key {
            let indent = indent_of(line);
            out.push_str(&format!("{indent}\"{key}\"\t\t\"{value}\"\n"));
            replaced = true;
        } else {
            out.push_str(line);
            out.push('\n');
        }
    }

    if replaced {
        return out;
    }
    insert_before_last_brace(content, &format!("\t\"{key}\"\t\t\"{value}\"\n"))
}

/// Insert `snippet` immediately before the last `}` in `content`.
/// Falls back to appending when there is no closing brace.
pub fn insert_before_last_brace(content: &str, snippet: &str) -> String {
    match content.rfind('}') {
        Some(pos) => {
            let mut patched = content.to_string();
            patched.insert_str(pos, snippet);
            patched
        }
        None => format!("{content}{snippet}"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn replaces_existing_value() {
        let input = "\"root\"\n{\n\t\"State\"\t\t\"1\"\n}\n";
        let out = replace_key_line(input, "State", "7");
        assert!(out.contains("\"State\"\t\t\"7\""));
        assert!(!out.contains("\"1\""));
    }

    #[test]
    fn appends_missing_key() {
        let input = "\"root\"\n{\n}\n";
        let out = replace_key_line(input, "State", "7");
        assert!(out.contains("\"State\"\t\t\"7\""));
    }
}
