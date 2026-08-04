//! Background poll for cooldowns that just expired; tray notification / auto sign-in.

use std::collections::HashMap;
use std::thread;
use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_notification::NotificationExt;

use super::store::{all, clear_cooldown};
use crate::roster;

const INTERVAL: Duration = Duration::from_secs(15);

/// Watch active cooldowns and notify when they finish.
pub fn start(app: AppHandle) {
    thread::spawn(move || {
        let mut watching: HashMap<String, u64> = HashMap::new();
        loop {
            thread::sleep(INTERVAL);
            let store = all();
            let now = unix_now();

            for (steamid, record) in &store {
                if record.cooldown_until > now {
                    watching
                        .entry(steamid.clone())
                        .or_insert(record.cooldown_until);
                }
            }

            let mut finished: Vec<String> = Vec::new();
            watching.retain(|steamid, until| {
                if *until <= now {
                    finished.push(steamid.clone());
                    false
                } else {
                    true
                }
            });

            if finished.is_empty() {
                continue;
            }

            let names = display_names(&finished);
            for steamid in &finished {
                let _ = clear_cooldown(steamid);
            }
            let _ = app.emit("accounts-changed", ());
            notify_finished(&app, &names);

            if crate::preferences::load().auto_sign_in_on_cooldown {
                auto_sign_in(&app, &finished);
            }
        }
    });
}

fn auto_sign_in(app: &AppHandle, finished: &[String]) {
    let Some(steamid) = pick_auto_sign_in(finished) else {
        return;
    };
    let Ok(account) = crate::bridge::find_account(&steamid) else {
        return;
    };
    let app = app.clone();
    std::thread::spawn(move || match crate::login::sign_in(&account, false) {
        Ok(message) => {
            crate::log::append(&message);
            let _ = crate::tray::rebuild(&app);
            let _ = app.emit("accounts-changed", ());
            let _ = app.emit("status", message);
        }
        Err(error) => {
            crate::log::append(format!("Error: {error}"));
            let _ = app.emit("status-error", error);
        }
    });
}

/// Prefer the finished account with the latest last_used; ties keep first.
fn pick_auto_sign_in(finished: &[String]) -> Option<String> {
    let store = all();
    finished
        .iter()
        .max_by_key(|steamid| store.get(*steamid).map(|r| r.last_used).unwrap_or(0))
        .cloned()
}

fn display_names(steamids: &[String]) -> Vec<String> {
    let roster = roster::list_tray().unwrap_or_default();
    let by_id: HashMap<_, _> = roster.iter().map(|a| (a.steamid.as_str(), a)).collect();
    steamids
        .iter()
        .map(|sid| {
            by_id
                .get(sid.as_str())
                .map(|a| a.display_name().to_string())
                .unwrap_or_else(|| sid.clone())
        })
        .collect()
}

fn notify_finished(app: &AppHandle, names: &[String]) {
    if names.is_empty() {
        return;
    }
    let _ = app
        .notification()
        .builder()
        .title("Cooldown finished")
        .body(finished_body(names))
        .show();

    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    if !window.is_visible().unwrap_or(false) {
        return;
    }
    let _ = app.emit("cooldown-finished", names);
}

fn finished_body(names: &[String]) -> String {
    if names.len() == 1 {
        return format!("{} is ready to sign in.", names[0]);
    }
    let preview: Vec<_> = names.iter().take(3).cloned().collect();
    let mut text = format!("{} accounts ready: {}", names.len(), preview.join(", "));
    if names.len() > 3 {
        text.push_str(&format!(" +{} more", names.len() - 3));
    }
    text
}

fn unix_now() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}
