//! The Steam program on this machine: where it lives, its process, autologin.

mod autologin;
mod location;
mod process;

use std::sync::{Mutex, MutexGuard, PoisonError};

pub use autologin::{clear_autologin_if_matches, set_autologin_user};
pub use location::{cache_dir, install_dir, localconfig_path, steamid3_from_steamid64};
pub use process::{launch, stop};

static MUTATION: Mutex<()> = Mutex::new(());

/// Serialize operations that stop Steam and rewrite its config files, so a
/// tray action and a window action can never interleave their writes.
pub fn mutation_guard() -> MutexGuard<'static, ()> {
    MUTATION.lock().unwrap_or_else(PoisonError::into_inner)
}
