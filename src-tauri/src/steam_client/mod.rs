//! Steam install path, process control, and AutoLoginUser.

mod autologin;
mod location;
mod process;

use std::path::Path;
use std::sync::{Mutex, MutexGuard, PoisonError};

pub use autologin::{autologin_user, clear_autologin_if_matches, set_autologin_user};
pub use location::{cache_dir, install_dir, localconfig_path, steamid3_from_steamid64};
pub use process::{is_running, launch, launch_cs2, stop};

static MUTATION: Mutex<()> = Mutex::new(());

pub fn mutation_guard() -> MutexGuard<'static, ()> {
    MUTATION.lock().unwrap_or_else(PoisonError::into_inner)
}

/// Run `op` with Steam stopped when it was running, then relaunch if needed.
pub fn while_stopped<T>(
    install: &Path,
    restore_minimized: bool,
    op: impl FnOnce() -> Result<T, String>,
) -> Result<T, String> {
    let restore = is_running();
    if restore {
        stop()?;
    }

    let result = op();

    if !restore {
        return result;
    }

    finish_restore(result, launch(install, restore_minimized))
}

fn finish_restore<T>(
    result: Result<T, String>,
    launch_result: Result<(), String>,
) -> Result<T, String> {
    match (result, launch_result) {
        (Ok(value), Ok(())) => Ok(value),
        (Ok(_), Err(launch_error)) => Err(launch_error),
        (Err(mutation_error), Ok(())) => Err(mutation_error),
        (Err(mutation_error), Err(launch_error)) => Err(format!(
            "{mutation_error}; also failed to restart Steam: {launch_error}"
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::finish_restore;

    #[test]
    fn restore_failure_surfaces_when_mutation_ok() {
        let err = finish_restore(Ok("done"), Err("launch failed".into())).unwrap_err();
        assert_eq!(err, "launch failed");
    }

    #[test]
    fn mutation_error_wins_alone() {
        let err = finish_restore::<()>(Err("remove failed".into()), Ok(())).unwrap_err();
        assert_eq!(err, "remove failed");
    }

    #[test]
    fn both_failures_are_reported() {
        let err = finish_restore::<()>(Err("remove failed".into()), Err("launch failed".into()))
            .unwrap_err();
        assert!(err.contains("remove failed"));
        assert!(err.contains("restart Steam"));
        assert!(err.contains("launch failed"));
    }

    #[test]
    fn successful_restore_keeps_mutation_ok() {
        assert_eq!(finish_restore(Ok(7), Ok(())).unwrap(), 7);
    }
}
