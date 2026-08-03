//! Removing a stored account from every place Steam remembers it.

mod remove;
mod successor;

pub use remove::{remove, remove_many};
