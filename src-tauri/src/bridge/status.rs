use std::sync::atomic::{AtomicBool, Ordering};

use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::status::{sweep, OnlineState, ProfileStatus};

/// Only one sweep runs at a time; extra requests are dropped silently.
static SWEEPING: AtomicBool = AtomicBool::new(false);

#[derive(Serialize, Clone)]
pub struct StatusView {
    pub steamid: String,
    pub state: &'static str,
    pub game: String,
}

/// Start a background status sweep over the whole roster. Each account's
/// result is emitted as an `account-status` event as soon as it arrives.
#[tauri::command]
pub fn refresh_statuses(app: AppHandle) -> Result<(), String> {
    let steamids: Vec<String> = crate::roster::list()?
        .into_iter()
        .map(|account| account.steamid)
        .collect();

    if steamids.is_empty() || SWEEPING.swap(true, Ordering::SeqCst) {
        return Ok(());
    }

    std::thread::spawn(move || {
        sweep(&steamids, |steamid, status| {
            if let Some(status) = status {
                let _ = app.emit("account-status", view(steamid, &status));
            }
        });
        SWEEPING.store(false, Ordering::SeqCst);
    });

    Ok(())
}

fn view(steamid: &str, status: &ProfileStatus) -> StatusView {
    StatusView {
        steamid: steamid.to_string(),
        state: match status.state {
            OnlineState::Offline => "offline",
            OnlineState::Online => "online",
            OnlineState::InGame => "in-game",
        },
        game: status.game.clone(),
    }
}
