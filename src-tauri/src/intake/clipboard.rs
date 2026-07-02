use arboard::Clipboard;

/// Current clipboard text, or a friendly message when it cannot be read.
pub fn read() -> Result<String, String> {
    let mut clipboard =
        Clipboard::new().map_err(|_| "The clipboard is unavailable right now.".to_string())?;
    clipboard
        .get_text()
        .map_err(|_| "Couldn't read text from the clipboard.".to_string())
}
