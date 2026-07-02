//! Stop Steam from downloading during gameplay right after sign-in.

use crate::vdf::replace_key_line;

/// Disable the "allow downloads during gameplay" preference.
pub fn pause(content: &str) -> String {
    replace_key_line(content, "AllowDownloadsDuringGameplay", "0")
}
