/// Sign-in toggles, mirrored from the Rust `Preferences` model.
export interface Preferences {
  always_invisible: boolean;
  cancel_downloads_on_login: boolean;
  streamer_mode: boolean;
  launch_steam_minimized: boolean;
  mute_notifications_on_login: boolean;
  minimize_to_tray_on_close: boolean;
  hide_from_capture: boolean;
  show_log_panel: boolean;
  launch_cs2_on_login: boolean;
  cs2_launch_options: string;
}

export const DEFAULT_PREFERENCES: Preferences = {
  always_invisible: true,
  cancel_downloads_on_login: false,
  streamer_mode: false,
  launch_steam_minimized: false,
  mute_notifications_on_login: false,
  minimize_to_tray_on_close: true,
  hide_from_capture: true,
  show_log_panel: false,
  launch_cs2_on_login: false,
  cs2_launch_options: "",
};
