use std::ffi::OsStr;
use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::Command;
use std::time::Duration;

use winreg::enums::HKEY_CURRENT_USER;
use winreg::RegKey;

// Suppress the console window that taskkill would otherwise flash.
const CREATE_NO_WINDOW: u32 = 0x0800_0000;
// Let Steam outlive this app.
const DETACHED_PROCESS: u32 = 0x0000_0008;

const PROCESS_NAMES: [&str; 2] = ["steam.exe", "steamwebhelper.exe"];

/// Stop Steam: first the tracked pid, then any lingering processes by name.
pub fn stop() -> Result<(), String> {
    kill_tracked_pid();
    kill_by_name();
    Ok(())
}

/// Whether Steam currently has a live client process.
pub fn is_running() -> bool {
    tracked_pid().is_some()
}

/// Launch `steam.exe` detached, optionally minimized to the tray.
pub fn launch(install: &Path, minimized: bool) -> Result<(), String> {
    spawn_steam(install, minimized, &[])
}

/// Launch CS2 (appid 730) after Steam is running.
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

/// Kill the pid Steam records under `ActiveProcess`, if any.
fn kill_tracked_pid() {
    let Some(pid) = tracked_pid() else {
        return;
    };
    if taskkill(&["/F", "/PID", &pid.to_string(), "/T"]) {
        std::thread::sleep(Duration::from_millis(800));
    }
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

/// Kill each Steam process by image name.
fn kill_by_name() {
    for name in PROCESS_NAMES {
        if taskkill(&["/F", "/IM", name, "/T"]) {
            std::thread::sleep(Duration::from_millis(400));
        }
    }
}

/// Run taskkill silently; returns whether a process was actually terminated.
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
