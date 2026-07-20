import { invoke } from "@tauri-apps/api/core";
import type { Preferences } from "../preferences/preferences";
import type { AccountView } from "../roster/account";

export interface ClassifyResult {
  expired: string[];
  importable: string[];
}

/// The single, typed surface for every backend command.
export const commands = {
  classifyImport: (payload: string) =>
    invoke<ClassifyResult>("classify_import", { payload }),
  clearCache: () => invoke<string>("clear_cache"),
  clearCooldown: (steamid: string) =>
    invoke<void>("clear_cooldown", { steamid }),
  clearCooldownMany: (steamids: string[]) =>
    invoke<void>("clear_cooldown_many", { steamids }),
  clearLogs: () => invoke<void>("clear_logs"),
  exportTokenEntries: (steamids: string[]) =>
    invoke<string[]>("export_token_entries", { steamids }),
  getLogs: () => invoke<string[]>("get_logs"),
  getPreferences: () => invoke<Preferences>("get_preferences"),
  importAccounts: (payload: string) =>
    invoke<string>("import_accounts", { payload }),
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
  setCooldown: (steamid: string, seconds: number) =>
    invoke<void>("set_cooldown", { seconds, steamid }),
  setCooldownMany: (steamids: string[], seconds: number) =>
    invoke<void>("set_cooldown_many", { seconds, steamids }),
  signIn: (steamid: string) => invoke<string>("sign_in", { steamid }),
  writeClipboard: (text: string) => invoke<void>("write_clipboard", { text }),
};
