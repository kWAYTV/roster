import { useCallback } from "react";

import { useToast } from "../feedback/toast";
import { commands } from "../platform/invoke";

/// Remove a stored account.
export function useForget() {
  const { notify } = useToast();

  const remove = useCallback(
    async (steamid: string) => {
      try {
        notify(await commands.removeAccount(steamid));
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify],
  );

  const removeMany = useCallback(
    async (steamids: string[]) => {
      if (steamids.length === 0) {
        return;
      }
      try {
        notify(await commands.removeAccounts(steamids));
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify],
  );

  return { remove, removeMany };
}
