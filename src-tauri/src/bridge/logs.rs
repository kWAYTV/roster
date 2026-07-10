#[tauri::command]
pub fn get_logs() -> Vec<String> {
    crate::log::lines()
}

#[tauri::command]
pub fn clear_logs() {
    crate::log::clear();
}
