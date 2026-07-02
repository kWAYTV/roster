//! `userdata/<id3>/config/localconfig.vdf`: per-account UI preferences.

use std::fs;
use std::path::Path;

/// Read the existing localconfig, or start from a minimal valid skeleton so
/// presence patches always have a tree to edit.
pub fn load_or_template(path: &Path) -> String {
    fs::read_to_string(path).unwrap_or_else(|_| template())
}

/// Persist localconfig, creating the userdata config directory if needed.
pub fn save(path: &Path, content: &str) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or("Could not resolve the userdata config directory.")?;
    fs::create_dir_all(parent).map_err(|_| "Failed to create the userdata config directory.")?;
    fs::write(path, content).map_err(|_| "Failed to write localconfig.vdf.".to_string())
}

fn template() -> String {
    "\"UserLocalConfigStore\"\n\
     {\n\
     \t\"friends\"\n\
     \t{\n\
     \t\t\"SignIntoFriends\"\t\t\"1\"\n\
     \t}\n\
     }\n"
    .to_string()
}
