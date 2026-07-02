import { invoke } from "@tauri-apps/api/core";

import type { AccountView } from "../roster/account";
import type { Preferences } from "../preferences/preferences";

/// The single, typed surface for every backend command.
export const commands = {
  listAccounts: () => invoke<AccountView[]>("list_accounts"),
  removeAccount: (steamid: string) => invoke<string>("remove_account", { steamid }),
  readClipboard: () => invoke<string>("read_clipboard"),
  importAccounts: (payload: string) => invoke<string>("import_accounts", { payload }),
  signIn: (steamid: string) => invoke<string>("sign_in", { steamid }),
  clearCache: () => invoke<string>("clear_cache"),
  getPreferences: () => invoke<Preferences>("get_preferences"),
  savePreferences: (preferences: Preferences) =>
    invoke<void>("save_preferences", { preferences }),
};
