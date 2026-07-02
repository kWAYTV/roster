import { useCallback } from "react";

import { useToast } from "../feedback/toast";
import { commands } from "../ipc/invoke";

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
    [notify],
  );

  const clear = useCallback(
    async (steamid: string) => {
      try {
        await commands.clearCooldown(steamid);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify],
  );

  return { start, clear };
}
