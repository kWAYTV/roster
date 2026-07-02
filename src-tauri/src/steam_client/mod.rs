//! The Steam program on this machine: where it lives, its process, autologin.

mod autologin;
mod location;
mod process;

pub use autologin::{clear_autologin_if_matches, set_autologin_user};
pub use location::{cache_dir, install_dir, localconfig_path, steamid3_from_steamid64};
pub use process::{launch, stop};
