import { invoke } from "@tauri-apps/api/core";

import type { AccountView } from "../roster/account";
import type { Preferences } from "../preferences/preferences";

export interface ClassifyResult {
  importable: string[];
  expired: string[];
}

/// The single, typed surface for every backend command.
export const commands = {
  listAccounts: () => invoke<AccountView[]>("list_accounts"),
  removeAccount: (steamid: string) => invoke<string>("remove_account", { steamid }),
  removeAccounts: (steamids: string[]) => invoke<string>("remove_accounts", { steamids }),
  readClipboard: () => invoke<string>("read_clipboard"),
  writeClipboard: (text: string) => invoke<void>("write_clipboard", { text }),
  classifyImport: (payload: string) =>
    invoke<ClassifyResult>("classify_import", { payload }),
  importAccounts: (payload: string) => invoke<string>("import_accounts", { payload }),
  signIn: (steamid: string) => invoke<string>("sign_in", { steamid }),
  setCooldown: (steamid: string, seconds: number) =>
    invoke<void>("set_cooldown", { steamid, seconds }),
  clearCooldown: (steamid: string) => invoke<void>("clear_cooldown", { steamid }),
  setCooldownMany: (steamids: string[], seconds: number) =>
    invoke<void>("set_cooldown_many", { steamids, seconds }),
  clearCooldownMany: (steamids: string[]) =>
    invoke<void>("clear_cooldown_many", { steamids }),
  exportTokenEntries: (steamids: string[]) =>
    invoke<string[]>("export_token_entries", { steamids }),
  openSteamProfile: (steamid: string) =>
    invoke<void>("open_steam_profile", { steamid }),
  openExternalUrl: (url: string) => invoke<void>("open_external_url", { url }),
  getLogs: () => invoke<string[]>("get_logs"),
  clearLogs: () => invoke<void>("clear_logs"),
  refreshStatuses: () => invoke<void>("refresh_statuses"),
  clearCache: () => invoke<string>("clear_cache"),
  getPreferences: () => invoke<Preferences>("get_preferences"),
  savePreferences: (preferences: Preferences) =>
    invoke<void>("save_preferences", { preferences }),
};
