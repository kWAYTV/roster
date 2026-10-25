//! Online status for accounts, read from the public Steam Community
//! profile XML (`/profiles/{steamid}/?xml=1`). No API key required.

mod fetch;
mod profile;

pub use fetch::{lookup_persona, lookup_personas, sweep, FetchedProfile};
pub use profile::OnlineState;
