use std::sync::atomic::{AtomicBool, Ordering};

use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::roster::Account;
use crate::status::{sweep, FetchedProfile, OnlineState};

/// Only one sweep runs at a time; requests that arrive mid-sweep are
/// coalesced into one follow-up sweep instead of being dropped.
static SWEEPING: AtomicBool = AtomicBool::new(false);
static QUEUED: AtomicBool = AtomicBool::new(false);

#[derive(Serialize, Clone)]
pub struct StatusView {
    pub steamid: String,
    pub state: &'static str,
    pub game: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar: Option<String>,
}

/// Start a background status sweep over the whole roster. Each account's
/// result is emitted as an `account-status` event as soon as it arrives.
#[tauri::command]
pub fn refresh_statuses(app: AppHandle) -> Result<(), String> {
    start_sweep(app);
    Ok(())
}

fn start_sweep(app: AppHandle) {
    if SWEEPING.swap(true, Ordering::SeqCst) {
        QUEUED.store(true, Ordering::SeqCst);
        return;
    }

    let accounts: Vec<Account> = crate::roster::list_tray().unwrap_or_default();
    let steamids = match crate::roster::steamids() {
        Ok(ids) if !ids.is_empty() => ids,
        _ => {
            SWEEPING.store(false, Ordering::SeqCst);
            return;
        }
    };

    std::thread::spawn(move || {
        sweep(&steamids, |steamid, fetched| {
            if let Some(fetched) = fetched {
                let account = accounts.iter().find(|item| item.steamid == steamid);
                let _ = app.emit("account-status", view(steamid, account, &fetched));
            }
        });
        SWEEPING.store(false, Ordering::SeqCst);
        if QUEUED.swap(false, Ordering::SeqCst) {
            start_sweep(app);
        }
    });
}

fn view(steamid: &str, account: Option<&Account>, fetched: &FetchedProfile) -> StatusView {
    let status = &fetched.status;
    let persona = status.persona_name.trim();
    let enrich_name = account.is_some_and(needs_profile_label)
        && !persona.is_empty()
        && !looks_like_steamid(persona);
    let enrich_avatar =
        account.is_some_and(|item| item.avatar_path.is_none()) && fetched.avatar.is_some();

    StatusView {
        steamid: steamid.to_string(),
        state: match status.state {
            OnlineState::Offline => "offline",
            OnlineState::Online => "online",
            OnlineState::InGame => "in-game",
        },
        game: status.game.clone(),
        display_name: enrich_name.then(|| persona.to_string()),
        avatar: if enrich_avatar {
            fetched.avatar.clone()
        } else {
            None
        },
    }
}

fn needs_profile_label(account: &Account) -> bool {
    !account.has_real_persona()
}

fn looks_like_steamid(value: &str) -> bool {
    value.len() >= 16 && value.chars().all(|c| c.is_ascii_digit())
}
