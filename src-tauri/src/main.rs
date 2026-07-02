// Hide the console window in release builds; keep it for debug.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    roster_lib::run();
}
