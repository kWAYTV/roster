//! The roster of remembered Steam accounts read from `loginusers.vdf`.

mod account;
mod avatar;
mod read;

pub use account::Account;
pub use read::list;
