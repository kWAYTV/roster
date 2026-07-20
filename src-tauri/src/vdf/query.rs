use super::tokens::quoted_fields;

/// Leading whitespace (tabs/spaces) of a line, preserved for re-indentation.
pub fn indent_of(line: &str) -> String {
    line.chars()
        .take_while(|c| *c == '\t' || *c == ' ')
        .collect()
}

/// Byte offset where `line_idx` begins, assuming `\n`-joined lines.
pub fn byte_offset_of_line(lines: &[&str], line_idx: usize) -> usize {
    lines.iter().take(line_idx).map(|line| line.len() + 1).sum()
}

/// Byte offset of the first line inside `key { ... }`, i.e. just after the
/// opening brace. Returns `None` when the key or its brace is missing.
pub fn block_body_offset(content: &str, key: &str) -> Option<usize> {
    let lines: Vec<&str> = content.lines().collect();
    let (_, open) = locate_block_open(&lines, key)?;
    Some(byte_offset_of_line(&lines, open + 1))
}

/// Inclusive `(open_brace_line, close_brace_line)` range for `key { ... }`.
pub fn block_range(lines: &[&str], key: &str) -> Option<(usize, usize)> {
    let (_, open) = locate_block_open(lines, key)?;
    let close = matching_close(lines, open)?;
    Some((open, close))
}

/// Find the `key` line and the following `{` line index (skipping blanks).
fn locate_block_open(lines: &[&str], key: &str) -> Option<(usize, usize)> {
    for (i, line) in lines.iter().enumerate() {
        let fields = quoted_fields(line);
        if fields.len() != 1 || !fields[0].eq_ignore_ascii_case(key) {
            continue;
        }
        let mut j = i + 1;
        while j < lines.len() && lines[j].trim().is_empty() {
            j += 1;
        }
        if j >= lines.len() || lines[j].trim() != "{" {
            continue;
        }
        return Some((i, j));
    }
    None
}

/// Index of the `}` that closes the brace opened at `open`.
fn matching_close(lines: &[&str], open: usize) -> Option<usize> {
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

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = "\"root\"\n{\n\t\"Accounts\"\n\t{\n\t\t\"me\"\n\t}\n}\n";

    #[test]
    fn finds_block_body_offset() {
        let offset = block_body_offset(SAMPLE, "Accounts").unwrap();
        assert_eq!(&SAMPLE[offset..offset + 5], "\t\t\"me");
    }

    #[test]
    fn finds_block_range() {
        let lines: Vec<&str> = SAMPLE.lines().collect();
        let (open, close) = block_range(&lines, "Accounts").unwrap();
        assert_eq!(lines[open].trim(), "{");
        assert_eq!(lines[close].trim(), "}");
    }

    #[test]
    fn indent_is_preserved() {
        assert_eq!(indent_of("\t\t\"k\"\t\"v\""), "\t\t");
    }
}
