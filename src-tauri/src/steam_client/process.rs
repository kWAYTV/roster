use std::ffi::OsStr;
use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::Command;
use std::time::Duration;

use winreg::enums::HKEY_CURRENT_USER;
use winreg::RegKey;

const CREATE_NO_WINDOW: u32 = 0x0800_0000;
const DETACHED_PROCESS: u32 = 0x0000_0008;

const CLIENT_NAME: &str = "steam.exe";
const ALL_NAMES: [&str; 2] = [CLIENT_NAME, "steamwebhelper.exe"];

const SHUTDOWN_WAIT: Duration = Duration::from_millis(800);
const KILL_SETTLE: Duration = Duration::from_millis(500);

/// Ask Steam to quit, then force-kill anything left.
pub fn stop() -> Result<(), String> {
    if !any_steam_process() {
        return Ok(());
    }

    request_shutdown();
    std::thread::sleep(SHUTDOWN_WAIT);
    if !any_steam_process() {
        return Ok(());
    }

    kill_tracked_pid();
    kill_by_name();
    std::thread::sleep(KILL_SETTLE);
    Ok(())
}

/// True when `steam.exe` is alive (helpers alone do not count).
pub fn is_running() -> bool {
    image_running(CLIENT_NAME)
}

pub fn launch(install: &Path, minimized: bool) -> Result<(), String> {
    spawn_steam(install, minimized, &[])
}

pub fn launch_cs2(install: &Path, options: &str) -> Result<(), String> {
    let mut args = vec!["-applaunch", "730"];
    if !options.trim().is_empty() {
        for part in options.split_whitespace() {
            args.push(part);
        }
    }
    spawn_steam(install, false, &args)
}

fn spawn_steam(install: &Path, minimized: bool, extra: &[&str]) -> Result<(), String> {
    let exe = install.join("steam.exe");
    if !exe.exists() {
        return Err("steam.exe was not found in the install directory.".to_string());
    }
    let mut cmd = Command::new(&exe);
    if minimized {
        cmd.arg("-silent");
    }
    for arg in extra {
        cmd.arg(arg);
    }
    cmd.creation_flags(DETACHED_PROCESS)
        .spawn()
        .map_err(|_| "Failed to start Steam.".to_string())?;
    Ok(())
}

fn request_shutdown() {
    let Ok(install) = super::install_dir() else {
        return;
    };
    let exe = install.join("steam.exe");
    if !exe.exists() {
        return;
    }
    let _ = silent(&exe).arg("-shutdown").spawn();
}

fn kill_tracked_pid() {
    let Some(pid) = tracked_pid() else {
        return;
    };
    if !pid_looks_like_steam(pid) {
        return;
    }
    let _ = taskkill(&["/F", "/PID", &pid.to_string(), "/T"]);
}

fn tracked_pid() -> Option<u32> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let key = hkcu
        .open_subkey("SOFTWARE\\Valve\\Steam\\ActiveProcess")
        .ok()?;
    let pid = key.get_value::<u32, _>("pid").ok()?;
    if pid == 0 {
        None
    } else {
        Some(pid)
    }
}

fn pid_looks_like_steam(pid: u32) -> bool {
    let Ok(output) = silent("tasklist")
        .args(["/FI", &format!("PID eq {pid}"), "/FO", "CSV", "/NH"])
        .output()
    else {
        return false;
    };
    let text = String::from_utf8_lossy(&output.stdout).to_ascii_lowercase();
    text.contains("steam.exe") || text.contains("steamwebhelper.exe")
}

fn kill_by_name() {
    for name in ALL_NAMES {
        let _ = taskkill(&["/F", "/IM", name, "/T"]);
    }
}

fn any_steam_process() -> bool {
    ALL_NAMES.iter().any(|name| image_running(name))
}

fn image_running(name: &str) -> bool {
    let Ok(output) = silent("tasklist")
        .args(["/FI", &format!("IMAGENAME eq {name}"), "/NH"])
        .output()
    else {
        return false;
    };
    let text = String::from_utf8_lossy(&output.stdout).to_ascii_lowercase();
    text.contains(&name.to_ascii_lowercase())
}

fn taskkill(args: &[&str]) -> bool {
    silent("taskkill")
        .args(args)
        .output()
        .map(|out| out.status.success())
        .unwrap_or(false)
}

fn silent(program: impl AsRef<OsStr>) -> Command {
    let mut cmd = Command::new(program);
    cmd.creation_flags(CREATE_NO_WINDOW);
    cmd
}
