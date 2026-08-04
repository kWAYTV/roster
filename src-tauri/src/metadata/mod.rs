//! Per-account metadata we track ourselves: last-used, cooldowns, pins, notes,
//! tags, and optional sign-in overrides.
//!
//! Keyed by SteamID and stored beside preferences, so it survives Steam cache
//! clears unless the user also resets app metadata.

mod record;
mod store;
mod watch;

pub use record::AccountMetadata;
pub use store::{
    all, clear_all, clear_cooldown, export_json, forget, import_json, mark_used, set_cooldown,
    set_note, set_overrides, set_pinned, set_tags,
};
pub use watch::start as start_cooldown_watch;
