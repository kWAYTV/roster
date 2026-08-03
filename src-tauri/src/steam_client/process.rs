use std::ffi::OsStr;
use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::Command;
use std::time::{Duration, Instant};

use winreg::enums::HKEY_CURRENT_USER;
use winreg::RegKey;

// Suppress the console window that taskkill would otherwise flash.
const CREATE_NO_WINDOW: u32 = 0x0800_0000;
// Let Steam outlive this app.
const DETACHED_PROCESS: u32 = 0x0000_0008;

const PROCESS_NAMES: [&str; 2] = ["steam.exe", "steamwebhelper.exe"];
const STOP_TIMEOUT: Duration = Duration::from_secs(10);
const STOP_POLL: Duration = Duration::from_millis(250);
const FILE_LOCK_SETTLE: Duration = Duration::from_millis(200);

/// Stop Steam: kill the tracked pid and lingering processes, then wait until
/// nothing is left so config writes cannot race a still-running client.
pub fn stop() -> Result<(), String> {
    kill_tracked_pid();
    kill_by_name();
    wait_until_stopped(STOP_TIMEOUT)
}

/// Whether any Steam client process is currently alive.
pub fn is_running() -> bool {
    any_steam_running()
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

/// Kill each Steam process by image name.
fn kill_by_name() {
    for name in PROCESS_NAMES {
        let _ = taskkill(&["/F", "/IM", name, "/T"]);
    }
}

fn wait_until_stopped(timeout: Duration) -> Result<(), String> {
    let started = Instant::now();
    while started.elapsed() < timeout {
        if !any_steam_running() {
            std::thread::sleep(FILE_LOCK_SETTLE);
            if !any_steam_running() {
                return Ok(());
            }
        }
        kill_by_name();
        std::thread::sleep(STOP_POLL);
    }

    if any_steam_running() {
        Err("Steam did not fully exit. Close it and try again.".to_string())
    } else {
        Ok(())
    }
}

fn any_steam_running() -> bool {
    PROCESS_NAMES.iter().any(|name| image_running(name))
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
