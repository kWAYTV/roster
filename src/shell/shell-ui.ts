import type { AccountView } from "../roster/account";

export interface ShellUiState {
  query: string;
  searchOpen: boolean;
  importOpen: boolean;
  importPrefill: string;
  settingsOpen: boolean;
  removeTargets: AccountView[];
  cooldownTarget: AccountView | null;
  bulkCooldownIds: string[];
}

export type ShellUiAction =
  | { type: "open-search" }
  | { type: "close-search" }
  | { type: "set-query"; query: string }
  | { type: "open-import"; prefill?: string }
  | { type: "close-import" }
  | { type: "open-settings" }
  | { type: "close-settings" }
  | { type: "ask-remove"; accounts: AccountView[] }
  | { type: "close-remove" }
  | { type: "ask-cooldown-sign-in"; account: AccountView }
  | { type: "close-cooldown" }
  | { type: "ask-bulk-cooldown"; steamids: string[] }
  | { type: "close-bulk-cooldown" };

export const initialShellUi: ShellUiState = {
  query: "",
  searchOpen: false,
  importOpen: false,
  importPrefill: "",
  settingsOpen: false,
  removeTargets: [],
  cooldownTarget: null,
  bulkCooldownIds: [],
};

export function shellUiReducer(state: ShellUiState, action: ShellUiAction): ShellUiState {
  switch (action.type) {
    case "open-search":
      return { ...state, searchOpen: true };
    case "close-search":
      return { ...state, searchOpen: false, query: "" };
    case "set-query":
      return { ...state, query: action.query };
    case "open-import":
      return {
        ...state,
        importOpen: true,
        importPrefill: action.prefill ?? "",
      };
    case "close-import":
      return { ...state, importOpen: false, importPrefill: "" };
    case "open-settings":
      return { ...state, settingsOpen: true };
    case "close-settings":
      return { ...state, settingsOpen: false };
    case "ask-remove":
      return { ...state, removeTargets: action.accounts };
    case "close-remove":
      return { ...state, removeTargets: [] };
    case "ask-cooldown-sign-in":
      return { ...state, cooldownTarget: action.account };
    case "close-cooldown":
      return { ...state, cooldownTarget: null };
    case "ask-bulk-cooldown":
      return { ...state, bulkCooldownIds: action.steamids };
    case "close-bulk-cooldown":
      return { ...state, bulkCooldownIds: [] };
  }
}
