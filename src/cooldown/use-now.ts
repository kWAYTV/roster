import { useSyncExternalStore } from "react";

import { nowSeconds } from "./cooldown";

/// The current Unix time, re-rendered every `intervalMs` for live countdowns.
export function useNow(intervalMs: number): number {
  return useSyncExternalStore(
    (onStoreChange) => subscribeClock(intervalMs, onStoreChange),
    nowSeconds,
    nowSeconds
  );
}

function subscribeClock(
  intervalMs: number,
  onStoreChange: () => void
): () => void {
  const timer = window.setInterval(onStoreChange, intervalMs);
  return () => window.clearInterval(timer);
}
