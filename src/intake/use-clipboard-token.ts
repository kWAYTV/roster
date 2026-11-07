import { useSyncExternalStore } from "react";

import { commands } from "@/platform/invoke";

import { looksLikeImport } from "./looks-like-import";

const POLL_MS = 1500;

let shown: string | null = null;
let dismissed = "";
let lastChecked = "";
let generation = 0;
const listeners = new Set<() => void>();
let timer: number | null = null;

function publish(next: string | null): void {
  if (next === shown) {
    return;
  }
  shown = next;
  for (const listener of listeners) {
    listener();
  }
}

function poll(): void {
  if (document.hidden) {
    return;
  }
  generation += 1;
  const ticket = generation;
  commands
    .readClipboard()
    .then((raw) => settle(ticket, raw.trim()))
    .catch(() => undefined);
}

function settle(ticket: number, raw: string): void {
  if (ticket !== generation) {
    return;
  }
  if (dismissed && raw !== dismissed) {
    dismissed = "";
  }
  if (!(raw && looksLikeImport(raw))) {
    lastChecked = "";
    publish(null);
    return;
  }
  if (raw === dismissed) {
    publish(null);
    return;
  }
  if (raw === shown || raw === lastChecked) {
    return;
  }
  lastChecked = raw;
  commands
    .classifyImport(raw)
    .then((classified) => {
      if (ticket !== generation || lastChecked !== raw) {
        return;
      }
      publish(classified.importable.length > 0 ? raw : null);
    })
    .catch(() => {
      if (ticket === generation && lastChecked === raw) {
        lastChecked = "";
      }
    });
}

/// Hide the button for this exact clipboard until it changes.
export function dismissClipboardToken(text: string): void {
  dismissed = text.trim();
  if (shown === dismissed) {
    publish(null);
  }
}

function ensurePolling(): void {
  if (timer !== null) {
    return;
  }
  document.addEventListener("visibilitychange", poll);
  window.addEventListener("focus", poll);
  poll();
  timer = window.setInterval(poll, POLL_MS);
}

function stopPolling(): void {
  if (timer === null) {
    return;
  }
  document.removeEventListener("visibilitychange", poll);
  window.removeEventListener("focus", poll);
  window.clearInterval(timer);
  timer = null;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  ensurePolling();
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      stopPolling();
    }
  };
}

/// Clipboard text that classifies as at least one importable token, or null.
export function useClipboardToken(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => shown,
    () => null
  );
}
