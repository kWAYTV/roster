import { useCallback } from "react";

import { useToast } from "../feedback/toast";
import { commands } from "../platform/invoke";

/// Start or clear an account cooldown; the roster refreshes via backend events.
export function useCooldown() {
  const { notify } = useToast();

  const start = useCallback(
    async (steamid: string, seconds: number) => {
      try {
        await commands.setCooldown(steamid, seconds);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  const clear = useCallback(
    async (steamid: string) => {
      try {
        await commands.clearCooldown(steamid);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  const startMany = useCallback(
    async (steamids: string[], seconds: number) => {
      try {
        await commands.setCooldownMany(steamids, seconds);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  const clearMany = useCallback(
    async (steamids: string[]) => {
      try {
        await commands.clearCooldownMany(steamids);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  return { clear, clearMany, start, startMany };
}
