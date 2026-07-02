import { listen, type UnlistenFn } from "@tauri-apps/api/event";

/// Fired by the backend after any change to the account list.
export function onAccountsChanged(handler: () => void): Promise<UnlistenFn> {
  return listen("accounts-changed", () => handler());
}

/// Fired after preferences are saved (e.g. from the tray).
export function onPreferencesChanged(handler: () => void): Promise<UnlistenFn> {
  return listen("preferences-changed", () => handler());
}

/// Success messages emitted by tray-initiated actions.
export function onStatus(handler: (message: string) => void): Promise<UnlistenFn> {
  return listen<string>("status", (event) => handler(event.payload));
}

/// Error messages emitted by tray-initiated actions.
export function onStatusError(handler: (message: string) => void): Promise<UnlistenFn> {
  return listen<string>("status-error", (event) => handler(event.payload));
}
