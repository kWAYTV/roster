//! Per-account metadata we track ourselves: last-used time and cooldowns.
//!
//! Keyed by SteamID and stored beside preferences, so it survives cache resets
//! and is independent of Steam's own config files.

mod record;
mod store;

pub use record::AccountMetadata;
pub use store::{all, clear_cooldown, forget, mark_used, set_cooldown};
