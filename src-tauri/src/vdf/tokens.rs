/// Extract the quoted string values from a single VDF line.
///
/// `"Key"        "Value"` yields `["Key", "Value"]`; a lone key such as a
/// SteamID header yields a single element.
pub fn quoted_fields(line: &str) -> Vec<String> {
    let mut fields = Vec::new();
    let mut chars = line.chars();

    while let Some(ch) = chars.next() {
        if ch != '"' {
            continue;
        }
        let mut value = String::new();
        for inner in chars.by_ref() {
            if inner == '"' {
                break;
            }
            value.push(inner);
        }
        fields.push(value);
    }

    fields
}

#[cfg(test)]
mod tests {
    use super::quoted_fields;

    #[test]
    fn reads_key_and_value() {
        assert_eq!(quoted_fields("\t\"Key\"\t\t\"Value\""), ["Key", "Value"]);
    }

    #[test]
    fn reads_lone_header() {
        assert_eq!(quoted_fields("\t\"76561199843081825\""), ["76561199843081825"]);
    }

    #[test]
    fn ignores_braces() {
        assert!(quoted_fields("\t{").is_empty());
    }
}
