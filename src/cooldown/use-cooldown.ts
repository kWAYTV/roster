import { useCallback } from "react";

import { notify } from "../feedback/status";
import { commands } from "../platform/invoke";

/// Start or clear an account cooldown; the roster refreshes via backend events.
export function useCooldown() {
  const start = useCallback(async (steamid: string, seconds: number) => {
    try {
      await commands.setCooldown(steamid, seconds);
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const clear = useCallback(async (steamid: string) => {
    try {
      await commands.clearCooldown(steamid);
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const startMany = useCallback(async (steamids: string[], seconds: number) => {
    try {
      await commands.setCooldownMany(steamids, seconds);
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const clearMany = useCallback(async (steamids: string[]) => {
    try {
      await commands.clearCooldownMany(steamids);
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  return { clear, clearMany, start, startMany };
}
