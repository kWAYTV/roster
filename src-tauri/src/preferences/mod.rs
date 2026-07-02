//! App preferences: the model and its JSON persistence.

mod model;
mod store;

pub use model::Preferences;
pub use store::{load, save};
