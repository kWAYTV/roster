use std::fs;
use std::path::{Path, PathBuf};
use std::time::Duration;

use super::activate::SignInPrefs;
use crate::presence::downloads;
use crate::steam_client::{launch, launch_cs2, localconfig_path, steamid3_from_steamid64};

/// Start Steam for the active account. Assumes callers already stopped Steam
/// so the freshly written config is not clobbered.
pub fn relaunch(install: &Path, steamid: &str, prefs: &SignInPrefs) -> Result<(), String> {
    std::thread::sleep(Duration::from_millis(400));
    launch(install, prefs.launch_steam_minimized)?;

    if prefs.cancel_downloads_on_login {
        if let Ok(steamid3) = steamid3_from_steamid64(steamid) {
            reassert_download_pause(localconfig_path(install, &steamid3));
        }
    }

    if prefs.launch_cs2_on_login {
        std::thread::sleep(Duration::from_secs(2));
        let _ = launch_cs2(install, &prefs.cs2_launch_options);
    }
    Ok(())
}

/// Steam rewrites localconfig on startup, so reapply the download pause once it
/// has settled.
fn reassert_download_pause(path: PathBuf) {
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_secs(5));
        if let Ok(content) = fs::read_to_string(&path) {
            let _ = fs::write(&path, downloads::pause(&content));
        }
    });
}
