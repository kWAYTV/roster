// Hide the console window in release builds; keep it for debug.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(not(windows))]
compile_error!("Roster only supports Windows.");

fn main() {
    roster_lib::run();
}
