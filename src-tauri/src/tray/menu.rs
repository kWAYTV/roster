use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::{AppHandle, Runtime};

use crate::roster::Account;

const MAX_LABEL: usize = 30;

pub(super) const SHOW: &str = "show";
pub(super) const IMPORT: &str = "import";
pub(super) const QUIT: &str = "quit";
pub(super) const SIGN_IN_PREFIX: &str = "signin:";

/// Build the full tray menu: show, import, the account list, then quit.
pub(super) fn build<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let show = MenuItem::with_id(app, SHOW, "Show", true, None::<&str>)?;
    let import = MenuItem::with_id(app, IMPORT, "Import", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, QUIT, "Quit", true, None::<&str>)?;
    let separator_top = PredefinedMenuItem::separator(app)?;
    let separator_bottom = PredefinedMenuItem::separator(app)?;

    let accounts = crate::roster::list_tray().unwrap_or_default();
    let streamer = crate::preferences::load().streamer_mode;
    let account_items = account_items(app, &accounts, streamer)?;

    let mut items: Vec<&dyn tauri::menu::IsMenuItem<R>> = vec![&show, &import, &separator_top];
    for item in &account_items {
        items.push(item);
    }
    items.push(&separator_bottom);
    items.push(&quit);

    Menu::with_items(app, &items)
}

fn account_items<R: Runtime>(
    app: &AppHandle<R>,
    accounts: &[Account],
    streamer: bool,
) -> tauri::Result<Vec<MenuItem<R>>> {
    if accounts.is_empty() {
        return Ok(vec![MenuItem::with_id(
            app,
            "empty",
            "No accounts",
            false,
            None::<&str>,
        )?]);
    }

    accounts
        .iter()
        .enumerate()
        .map(|(index, account)| {
            let id = format!("{SIGN_IN_PREFIX}{}", account.steamid);
            MenuItem::with_id(app, id, label(account, index, streamer), true, None::<&str>)
        })
        .collect()
}

fn label(account: &Account, index: usize, streamer: bool) -> String {
    let base = if streamer {
        format!("Account {}", index + 1)
    } else {
        truncate(account.display_name())
    };
    if account.most_recent {
        format!("{base}  •")
    } else {
        base
    }
}

fn truncate(name: &str) -> String {
    if name.chars().count() <= MAX_LABEL {
        return name.to_string();
    }
    let head: String = name.chars().take(MAX_LABEL - 1).collect();
    format!("{head}\u{2026}")
}
