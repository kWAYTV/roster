//! Online status for accounts, read from the public Steam Community
//! profile XML (`/profiles/{steamid}/?xml=1`). No API key required.

mod fetch;
mod profile;

pub use fetch::sweep;
pub use profile::{OnlineState, ProfileStatus};
