import { invoke } from "@tauri-apps/api/core";
import type { Preferences } from "../preferences/preferences";
import type { AccountView } from "../roster/account";

export interface ClassifyResult {
  expired: string[];
  importable: string[];
  new_count: number;
  update_count: number;
}

export interface OverridePatch {
  always_invisible: boolean | null;
  cs2_launch_options: string | null;
  launch_cs2: boolean | null;
  mute_notifications: boolean | null;
}

export interface TokenHealth {
  account_name: string;
  jwt_expires_in: number;
  status: "ok" | "expired" | "missing" | "invalid";
  steamid: string;
}

/// The single, typed surface for every backend command.
export const commands = {
  checkTokens: () => invoke<TokenHealth[]>("check_tokens"),
  classifyImport: (payload: string) =>
    invoke<ClassifyResult>("classify_import", { payload }),
  clearCache: () => invoke<string>("clear_cache"),
  clearCooldown: (steamid: string) =>
    invoke<void>("clear_cooldown", { steamid }),
  clearCooldownMany: (steamids: string[]) =>
    invoke<void>("clear_cooldown_many", { steamids }),
  clearLogs: () => invoke<void>("clear_logs"),
  clearNotesMany: (steamids: string[]) =>
    invoke<string>("clear_notes_many", { steamids }),
  exportMetadata: () => invoke<string>("export_metadata"),
  exportTokenEntries: (steamids: string[]) =>
    invoke<string[]>("export_token_entries", { steamids }),
  getLogs: () => invoke<string[]>("get_logs"),
  getPreferences: () => invoke<Preferences>("get_preferences"),
  importAccounts: (payload: string) =>
    invoke<string>("import_accounts", { payload }),
  importMetadata: (payload: string) =>
    invoke<string>("import_metadata", { payload }),
  isSteamRunning: () => invoke<boolean>("is_steam_running"),
  listAccounts: () => invoke<AccountView[]>("list_accounts"),
  openExternalUrl: (url: string) => invoke<void>("open_external_url", { url }),
  openSteamProfile: (steamid: string) =>
    invoke<void>("open_steam_profile", { steamid }),
  readClipboard: () => invoke<string>("read_clipboard"),
  refreshStatuses: () => invoke<void>("refresh_statuses"),
  removeAccount: (steamid: string) =>
    invoke<string>("remove_account", { steamid }),
  removeAccounts: (steamids: string[]) =>
    invoke<string>("remove_accounts", { steamids }),
  savePreferences: (preferences: Preferences) =>
    invoke<void>("save_preferences", { preferences }),
  setAccountOverrides: (steamid: string, patch: OverridePatch) =>
    invoke<string>("set_account_overrides", { patch, steamid }),
  setCooldown: (steamid: string, seconds: number) =>
    invoke<void>("set_cooldown", { seconds, steamid }),
  setCooldownMany: (steamids: string[], seconds: number) =>
    invoke<void>("set_cooldown_many", { seconds, steamids }),
  setNote: (steamid: string, note: string) =>
    invoke<string>("set_note", { note, steamid }),
  setPinned: (steamid: string, pinned: boolean) =>
    invoke<string>("set_pinned", { pinned, steamid }),
  setPinnedMany: (steamids: string[], pinned: boolean) =>
    invoke<string>("set_pinned_many", { pinned, steamids }),
  setTags: (steamid: string, tags: string[]) =>
    invoke<string>("set_tags", { steamid, tags }),
  signIn: (steamid: string, forceInvisible = false) =>
    invoke<string>("sign_in", {
      forceInvisible: forceInvisible ? true : null,
      steamid,
    }),
  writeClipboard: (text: string) => invoke<void>("write_clipboard", { text }),
};
