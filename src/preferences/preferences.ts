/// Sign-in toggles, mirrored from the Rust `Preferences` model.
export interface Preferences {
  always_invisible: boolean;
  cancel_downloads_on_login: boolean;
  streamer_mode: boolean;
  launch_steam_minimized: boolean;
  mute_notifications_on_login: boolean;
  minimize_to_tray_on_close: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  always_invisible: true,
  cancel_downloads_on_login: false,
  streamer_mode: false,
  launch_steam_minimized: false,
  mute_notifications_on_login: false,
  minimize_to_tray_on_close: true,
};
