use super::find_account;

#[tauri::command]
pub fn export_token_entries(steamids: Vec<String>) -> Result<Vec<String>, String> {
    let mut accounts = Vec::with_capacity(steamids.len());
    for steamid in steamids {
        accounts.push(find_account(&steamid)?);
    }
    Ok(crate::export::entries_for(&accounts))
}
