use arboard::Clipboard;

/// Current clipboard text, or a friendly message when it cannot be read.
pub fn read() -> Result<String, String> {
    let mut clipboard =
        Clipboard::new().map_err(|_| "The clipboard is unavailable right now.".to_string())?;
    clipboard
        .get_text()
        .map_err(|_| "Couldn't read text from the clipboard.".to_string())
}

/// Write `text` to the system clipboard.
pub fn write(text: &str) -> Result<(), String> {
    let mut clipboard =
        Clipboard::new().map_err(|_| "The clipboard is unavailable right now.".to_string())?;
    clipboard
        .set_text(text)
        .map_err(|_| "Couldn't write to the clipboard.".to_string())
}
