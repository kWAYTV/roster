use std::path::{Path, PathBuf};

use winreg::enums::HKEY_CURRENT_USER;
use winreg::RegKey;

// Base offset that separates a SteamID64 from its 32-bit account id.
const STEAMID64_BASE: u64 = 76_561_197_960_265_728;

/// Steam install directory, read from `HKCU\Software\Valve\Steam\SteamPath`.
pub fn install_dir() -> Result<PathBuf, String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let key = hkcu
        .open_subkey("SOFTWARE\\Valve\\Steam")
        .map_err(|_| "Steam is not installed, or its registry entry is unreadable.".to_string())?;
    let path: String = key
        .get_value("SteamPath")
        .map_err(|_| "The Steam install path is missing from the registry.".to_string())?;
    Ok(PathBuf::from(path))
}

/// `%LOCALAPPDATA%\Steam`, home of `local.vdf`.
pub fn cache_dir() -> Result<PathBuf, String> {
    let local = std::env::var("LOCALAPPDATA")
        .map_err(|_| "LOCALAPPDATA is not set; the Steam cache path is unknown.".to_string())?;
    Ok(Path::new(&local).join("Steam"))
}

/// Convert a SteamID64 string into its 32-bit account id ("SteamID3").
pub fn steamid3_from_steamid64(steamid64: &str) -> Result<String, String> {
    let id: u64 = steamid64
        .parse()
        .map_err(|_| "The SteamID is not a valid number.".to_string())?;
    if id < STEAMID64_BASE {
        return Err("The SteamID is out of range.".to_string());
    }
    Ok((id - STEAMID64_BASE).to_string())
}

/// `<install>/userdata/<id3>/config`.
pub fn userdata_config_dir(install: &Path, steamid3: &str) -> PathBuf {
    install.join("userdata").join(steamid3).join("config")
}

/// `<install>/userdata/<id3>/config/localconfig.vdf`.
pub fn localconfig_path(install: &Path, steamid3: &str) -> PathBuf {
    userdata_config_dir(install, steamid3).join("localconfig.vdf")
}

#[cfg(test)]
mod tests {
    use super::steamid3_from_steamid64;

    #[test]
    fn converts_known_id() {
        assert_eq!(steamid3_from_steamid64("76561197960265729").unwrap(), "1");
    }

    #[test]
    fn rejects_non_numeric() {
        assert!(steamid3_from_steamid64("not-an-id").is_err());
    }
}
