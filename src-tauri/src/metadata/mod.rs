//! Per-account metadata we track ourselves: last-used, cooldowns, pins, notes,
//! and optional sign-in overrides.
//!
//! Keyed by SteamID and stored beside preferences, so it survives cache resets
//! and is independent of Steam's own config files.

mod record;
mod store;
mod watch;

pub use record::AccountMetadata;
pub use store::{
    all, clear_cooldown, export_json, forget, import_json, mark_used, set_cooldown, set_note,
    set_overrides, set_pinned,
};
pub use watch::start as start_cooldown_watch;
