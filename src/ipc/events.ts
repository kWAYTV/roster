import { listen, type UnlistenFn } from "@tauri-apps/api/event";

import type { OnlineState } from "../status/status";

interface StatusPayload {
  steamid: string;
  state: OnlineState;
  game: string;
}

/// Streamed per-account results while a backend status sweep runs.
export function onAccountStatus(handler: (status: StatusPayload) => void): Promise<UnlistenFn> {
  return listen<StatusPayload>("account-status", (event) => handler(event.payload));
}

/// Fired by the backend after any change to the account list.
export function onAccountsChanged(handler: () => void): Promise<UnlistenFn> {
  return listen("accounts-changed", () => handler());
}

/// Fired by the tray Import action; carries the clipboard contents so the
/// import dialog can open prefilled for review.
export function onImportRequest(handler: (text: string) => void): Promise<UnlistenFn> {
  return listen<string>("import-request", (event) => handler(event.payload));
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

/// Account display names whose cooldown just ended (tray notification already sent).
export function onCooldownFinished(handler: (names: string[]) => void): Promise<UnlistenFn> {
  return listen<string[]>("cooldown-finished", (event) => handler(event.payload));
}
