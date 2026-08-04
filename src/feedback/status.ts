import { useSyncExternalStore } from "react";

export type StatusKind = "ok" | "error";

export interface StatusEntry {
  id: number;
  kind: StatusKind;
  message: string;
}

const OK_MS = 2800;
const ERROR_MS = 5600;

let entry: StatusEntry | null = null;
let seq = 0;
let clearTimer: number | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function scheduleClear(kind: StatusKind): void {
  if (clearTimer !== null) {
    window.clearTimeout(clearTimer);
  }
  clearTimer = window.setTimeout(
    () => {
      entry = null;
      clearTimer = null;
      emit();
    },
    kind === "error" ? ERROR_MS : OK_MS
  );
}

/** Push a quiet footer status. Replaces toasts. */
export function notify(message: string, kind: StatusKind = "ok"): void {
  const text = message.trim();
  if (!text) {
    return;
  }
  seq += 1;
  entry = { id: seq, kind, message: text };
  emit();
  scheduleClear(kind);
}

/** Dismiss the current status early (click). */
export function dismissStatus(): void {
  if (clearTimer !== null) {
    window.clearTimeout(clearTimer);
    clearTimer = null;
  }
  if (entry === null) {
    return;
  }
  entry = null;
  emit();
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function useStatusEntry(): StatusEntry | null {
  return useSyncExternalStore(
    subscribe,
    () => entry,
    () => null
  );
}
