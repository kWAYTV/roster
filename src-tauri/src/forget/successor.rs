//! After forgetting the active autologin account, hand Steam off to a remaining one.

use std::path::Path;

use crate::steam_client::set_autologin_user;
use crate::steam_config::loginusers;

/// When the forgotten account owned AutoLoginUser, point Steam at a successor
/// so the next launch (or next explicit sign-in) has a coherent active login.
/// Does not relaunch Steam — forget stays a remove operation.
pub fn handoff_if_needed(loginusers_path: &Path, cleared_active: bool) -> Result<(), String> {
    if !cleared_active {
        return Ok(());
    }

    let Some((username, steamid)) = loginusers::pick_successor(loginusers_path)? else {
        return Ok(());
    };

    loginusers::set_active(loginusers_path, &username, &steamid)?;
    set_autologin_user(&username)
}
