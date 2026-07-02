use std::fs;

use super::account::Account;
use super::avatar;
use crate::steam_client::install_dir;
use crate::vdf::quoted_fields;

/// All remembered accounts, most-recent first then alphabetical by display name.
pub fn list() -> Result<Vec<Account>, String> {
    let install = install_dir()?;
    let path = install.join("config").join("loginusers.vdf");
    let content = fs::read_to_string(&path)
        .map_err(|_| "Couldn't read loginusers.vdf. Open Steam once first.".to_string())?;

    let mut accounts = parse(&content);
    let metadata = crate::metadata::all();
    for account in &mut accounts {
        account.avatar_path = avatar::resolve(&install, account);
        account.metadata = metadata.get(&account.steamid).copied().unwrap_or_default();
    }
    accounts.sort_by(|a, b| {
        b.most_recent
            .cmp(&a.most_recent)
            .then_with(|| a.display_name().cmp(b.display_name()))
    });
    Ok(accounts)
}

/// Parse the `steamid { field ... }` blocks into accounts.
fn parse(content: &str) -> Vec<Account> {
    let mut accounts = Vec::new();
    let mut current: Option<Account> = None;

    for line in content.lines() {
        let fields = quoted_fields(line);

        if fields.len() == 1 && is_steamid64(&fields[0]) {
            current = Some(Account {
                steamid: fields[0].clone(),
                ..Account::default()
            });
            continue;
        }

        if line.trim() == "}" {
            if let Some(account) = current.take() {
                if !account.steamid.is_empty() {
                    accounts.push(account);
                }
            }
            continue;
        }

        if let (Some(account), 2) = (current.as_mut(), fields.len()) {
            assign_field(account, &fields[0], &fields[1]);
        }
    }

    accounts
}

fn assign_field(account: &mut Account, key: &str, value: &str) {
    match key {
        "AccountName" => account.account_name = value.to_string(),
        "PersonaName" => account.persona_name = value.to_string(),
        "Avatar" => account.avatar_hash = Some(value.to_string()),
        "MostRecent" => account.most_recent = value == "1",
        _ => {}
    }
}

fn is_steamid64(value: &str) -> bool {
    value.len() >= 16 && value.chars().all(|c| c.is_ascii_digit())
}

#[cfg(test)]
mod tests {
    use super::parse;

    #[test]
    fn parses_two_accounts() {
        let content = "\"users\"\n{\n\t\"76561199843081825\"\n\t{\n\t\t\"AccountName\"\t\t\"a\"\n\t\t\"PersonaName\"\t\t\"Alpha\"\n\t\t\"MostRecent\"\t\t\"1\"\n\t}\n\t\"76561199194545602\"\n\t{\n\t\t\"AccountName\"\t\t\"b\"\n\t}\n}\n";
        let accounts = parse(content);
        assert_eq!(accounts.len(), 2);
        assert_eq!(accounts[0].display_name(), "Alpha");
        assert!(accounts[0].most_recent);
    }
}
