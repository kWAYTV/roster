/// Sign-in toggles, mirrored from the Rust `Preferences` model.
export interface Preferences {
  always_invisible: boolean;
  cancel_downloads_on_login: boolean;
  cs2_launch_options: string;
  hide_from_capture: boolean;
  launch_cs2_on_login: boolean;
  launch_steam_minimized: boolean;
  minimize_to_tray_on_close: boolean;
  mute_notifications_on_login: boolean;
  show_log_panel: boolean;
  streamer_mode: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  always_invisible: true,
  cancel_downloads_on_login: false,
  cs2_launch_options: "",
  hide_from_capture: true,
  launch_cs2_on_login: false,
  launch_steam_minimized: false,
  minimize_to_tray_on_close: true,
  mute_notifications_on_login: false,
  show_log_panel: false,
  streamer_mode: false,
};
