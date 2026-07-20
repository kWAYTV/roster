import type { Preferences } from "./preferences";

type BoolPreferenceKey = {
  [K in keyof Preferences]: Preferences[K] extends boolean ? K : never;
}[keyof Preferences];

export interface BoolSetting {
  description: string;
  key: BoolPreferenceKey;
  label: string;
}

export const SIGN_IN_SETTINGS: BoolSetting[] = [
  {
    description: "Sign in as Invisible instead of Online.",
    key: "always_invisible",
    label: "Always start invisible",
  },
  {
    description: "Pause active downloads right after signing in.",
    key: "cancel_downloads_on_login",
    label: "Cancel downloads on login",
  },
  {
    description: "Start Steam in the background after sign-in.",
    key: "launch_steam_minimized",
    label: "Launch Steam minimized",
  },
  {
    description: "Turn off friend online and message notifications.",
    key: "mute_notifications_on_login",
    label: "Mute notifications on login",
  },
  {
    description: "Start Counter-Strike 2 after Steam opens.",
    key: "launch_cs2_on_login",
    label: "Launch CS2 on sign-in",
  },
  {
    description: "Store tokens only — do not stop Steam or switch account.",
    key: "import_without_sign_in",
    label: "Import without signing in",
  },
];

export const PRIVACY_SETTINGS: BoolSetting[] = [
  {
    description: "Mask usernames and avatars in this app and the tray.",
    key: "streamer_mode",
    label: "Streamer mode",
  },
  {
    description: "Exclude this window from Discord, OBS, and similar capture.",
    key: "hide_from_capture",
    label: "Hide from screen capture",
  },
];

export const APP_SETTINGS: BoolSetting[] = [
  {
    description: "Display recent backend output at the bottom of the window.",
    key: "show_log_panel",
    label: "Show log panel",
  },
  {
    description:
      "Keep Roster running in the system tray when you close the window.",
    key: "minimize_to_tray_on_close",
    label: "Minimize to tray on close",
  },
];
