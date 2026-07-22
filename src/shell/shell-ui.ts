import type { AccountView } from "../roster/account";

export interface ShellUiState {
  bulkCooldownIds: string[];
  cooldownTarget: AccountView | null;
  importOpen: boolean;
  importPrefill: string;
  /** Bumps on each open so ImportDialog remounts with fresh prefill. */
  importSession: number;
  query: string;
  removeTargets: AccountView[];
  searchOpen: boolean;
  settingsOpen: boolean;
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
  bulkCooldownIds: [],
  cooldownTarget: null,
  importOpen: false,
  importPrefill: "",
  importSession: 0,
  query: "",
  removeTargets: [],
  searchOpen: false,
  settingsOpen: false,
};

export function shellUiReducer(
  state: ShellUiState,
  action: ShellUiAction
): ShellUiState {
  switch (action.type) {
    case "open-search":
      return { ...state, searchOpen: true };
    case "close-search":
      return { ...state, query: "", searchOpen: false };
    case "set-query":
      return { ...state, query: action.query };
    case "open-import":
      return {
        ...state,
        importOpen: true,
        importPrefill: action.prefill ?? "",
        // Remount only when opening from closed — remount-while-open orphans the portal.
        importSession: state.importOpen
          ? state.importSession
          : state.importSession + 1,
      };
    case "close-import":
      // Keep session/prefill — dialog stays mounted with open=false so the
      // portal can tear down cleanly (unmount-while-open left a stuck backdrop).
      return { ...state, importOpen: false };
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
    default:
      return state;
  }
}
