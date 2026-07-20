import type { Preferences } from "./preferences";

export interface BoolSetting {
  key: keyof Preferences;
  label: string;
  description: string;
}

export const SIGN_IN_SETTINGS: BoolSetting[] = [
  {
    key: "always_invisible",
    label: "Always start invisible",
    description: "Sign in as Invisible instead of Online.",
  },
  {
    key: "cancel_downloads_on_login",
    label: "Cancel downloads on login",
    description: "Pause active downloads right after signing in.",
  },
  {
    key: "launch_steam_minimized",
    label: "Launch Steam minimized",
    description: "Start Steam in the background after sign-in.",
  },
  {
    key: "mute_notifications_on_login",
    label: "Mute notifications on login",
    description: "Turn off friend online and message notifications.",
  },
  {
    key: "launch_cs2_on_login",
    label: "Launch CS2 on sign-in",
    description: "Start Counter-Strike 2 after Steam opens.",
  },
];

export const PRIVACY_SETTINGS: BoolSetting[] = [
  {
    key: "streamer_mode",
    label: "Streamer mode",
    description: "Mask usernames and avatars in this app and the tray.",
  },
  {
    key: "hide_from_capture",
    label: "Hide from screen capture",
    description: "Exclude this window from Discord, OBS, and similar capture.",
  },
];

export const APP_SETTINGS: BoolSetting[] = [
  {
    key: "show_log_panel",
    label: "Show log panel",
    description: "Display recent backend output at the bottom of the window.",
  },
  {
    key: "minimize_to_tray_on_close",
    label: "Minimize to tray on close",
    description: "Keep Roster running in the system tray when you close the window.",
  },
];
