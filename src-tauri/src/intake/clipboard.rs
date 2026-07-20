use arboard::Clipboard;

/// Current clipboard text, or a short error when it cannot be read.
pub fn read() -> Result<String, String> {
    let mut clipboard =
        Clipboard::new().map_err(|_| "Clipboard unavailable".to_string())?;
    clipboard
        .get_text()
        .map_err(|_| "Clipboard read failed".to_string())
}

/// Write `text` to the system clipboard.
pub fn write(text: &str) -> Result<(), String> {
    let mut clipboard =
        Clipboard::new().map_err(|_| "Clipboard unavailable".to_string())?;
    clipboard
        .set_text(text)
        .map_err(|_| "Clipboard write failed".to_string())
}
