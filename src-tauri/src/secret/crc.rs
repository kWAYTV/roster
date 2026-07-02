/// Steam's `ConnectCache` key for an account: the CRC32 of the account name
/// as hex, with leading zeros stripped and a `1` appended.
pub fn store_key(account_name: &str) -> String {
    let crc = crc32fast::hash(account_name.as_bytes());
    let hex = format!("{crc:08x}");
    let trimmed = hex.trim_start_matches('0');
    if trimmed.is_empty() {
        "01".to_string()
    } else {
        format!("{trimmed}1")
    }
}

#[cfg(test)]
mod tests {
    use super::store_key;

    #[test]
    fn appends_one_suffix() {
        let key = store_key("someaccount");
        assert!(key.ends_with('1'));
        assert!(key.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn is_stable_for_same_input() {
        assert_eq!(store_key("player_one"), store_key("player_one"));
    }
}
