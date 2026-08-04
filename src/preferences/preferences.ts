import type { ThemeMode } from "@/theme/theme-mode";

export type ImportWithoutSignIn = "off" | "ask" | "on";

export const IMPORT_WITHOUT_SIGN_IN_MODES: readonly ImportWithoutSignIn[] = [
  "off",
  "ask",
  "on",
];

/// Coerce legacy booleans and unknown values to off/ask/on (default off).
export function normalizeImportWithoutSignIn(
  value: unknown
): ImportWithoutSignIn {
  if (value === true || value === "on") {
    return "on";
  }
  if (value === "ask") {
    return "ask";
  }
  return "off";
}

/// Sign-in toggles, mirrored from the Rust `Preferences` model.
export interface Preferences {
  always_invisible: boolean;
  auto_sign_in_on_cooldown: boolean;
  cancel_downloads_on_login: boolean;
  cs2_launch_options: string;
  hide_from_capture: boolean;
  import_without_sign_in: ImportWithoutSignIn;
  launch_cs2_on_login: boolean;
  launch_steam_minimized: boolean;
  minimize_to_tray_on_close: boolean;
  mute_notifications_on_login: boolean;
  show_log_panel: boolean;
  streamer_mode: boolean;
  theme: ThemeMode;
  /** 0 = disabled. */
  warn_jwt_expiry_days: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  always_invisible: true,
  auto_sign_in_on_cooldown: false,
  cancel_downloads_on_login: false,
  cs2_launch_options: "",
  hide_from_capture: true,
  import_without_sign_in: "off",
  launch_cs2_on_login: false,
  launch_steam_minimized: false,
  minimize_to_tray_on_close: true,
  mute_notifications_on_login: false,
  show_log_panel: false,
  streamer_mode: false,
  theme: "dark",
  warn_jwt_expiry_days: 7,
};
