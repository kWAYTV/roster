import { useSyncExternalStore } from "react";

import { commands } from "../platform/invoke";

const POLL_MS = 4000;

let running = false;
const listeners = new Set<() => void>();
let timer: number | null = null;

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  ensurePolling();
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

function ensurePolling() {
  if (timer !== null) {
    return;
  }
  const poll = () => {
    commands
      .isSteamRunning()
      .then((next) => {
        if (next === running) {
          return;
        }
        running = next;
        for (const listener of listeners) {
          listener();
        }
      })
      .catch(() => undefined);
  };
  poll();
  timer = window.setInterval(poll, POLL_MS);
}

/// Whether the Steam client (`steam.exe`) is currently running.
export function useSteamRunning(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => running,
    () => false
  );
}
