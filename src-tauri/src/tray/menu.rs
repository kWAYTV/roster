use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Runtime};

use crate::roster::Account;

const MAX_LABEL: usize = 30;

pub(super) const SHOW: &str = "show";
pub(super) const IMPORT: &str = "import";
pub(super) const QUIT: &str = "quit";
pub(super) const SIGN_IN_PREFIX: &str = "signin:";
pub(super) const SIGN_IN_INVISIBLE_PREFIX: &str = "signin-invisible:";

/// Build the full tray menu: show, import, the account list, then quit.
pub(super) fn build<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let show = MenuItem::with_id(app, SHOW, "Show", true, None::<&str>)?;
    let import = MenuItem::with_id(app, IMPORT, "Import", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, QUIT, "Quit", true, None::<&str>)?;
    let separator_top = PredefinedMenuItem::separator(app)?;
    let separator_bottom = PredefinedMenuItem::separator(app)?;

    let accounts = crate::roster::list_tray().unwrap_or_default();
    let streamer = crate::preferences::load().streamer_mode;

    if accounts.is_empty() {
        let empty = MenuItem::with_id(app, "empty", "No accounts", false, None::<&str>)?;
        return Menu::with_items(
            app,
            &[
                &show,
                &import,
                &separator_top,
                &empty,
                &separator_bottom,
                &quit,
            ],
        );
    }

    let account_menus = account_submenus(app, &accounts, streamer)?;
    let mut items: Vec<&dyn tauri::menu::IsMenuItem<R>> = vec![&show, &import, &separator_top];
    for item in &account_menus {
        items.push(item);
    }
    items.push(&separator_bottom);
    items.push(&quit);

    Menu::with_items(app, &items)
}

fn account_submenus<R: Runtime>(
    app: &AppHandle<R>,
    accounts: &[Account],
    streamer: bool,
) -> tauri::Result<Vec<Submenu<R>>> {
    accounts
        .iter()
        .enumerate()
        .map(|(index, account)| {
            let sign_in = MenuItem::with_id(
                app,
                format!("{SIGN_IN_PREFIX}{}", account.steamid),
                "Sign in",
                true,
                None::<&str>,
            )?;
            let invisible = MenuItem::with_id(
                app,
                format!("{SIGN_IN_INVISIBLE_PREFIX}{}", account.steamid),
                "Sign in invisible",
                true,
                None::<&str>,
            )?;
            Submenu::with_items(
                app,
                label(account, index, streamer),
                true,
                &[&sign_in, &invisible],
            )
        })
        .collect()
}

fn label(account: &Account, index: usize, streamer: bool) -> String {
    let pin = if account.metadata.pinned { "★ " } else { "" };
    let base = if streamer {
        format!("Account {}", index + 1)
    } else {
        truncate(account.display_name())
    };
    if account.most_recent {
        format!("{pin}{base}  •")
    } else {
        format!("{pin}{base}")
    }
}

fn truncate(name: &str) -> String {
    if name.chars().count() <= MAX_LABEL {
        return name.to_string();
    }
    let head: String = name.chars().take(MAX_LABEL - 1).collect();
    format!("{head}\u{2026}")
}
