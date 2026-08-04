import { useCallback } from "react";

import { notify } from "../feedback/status";
import { commands } from "../platform/invoke";

/// Remove a stored account.
export function useForget() {
  const remove = useCallback(async (steamid: string) => {
    try {
      notify(await commands.removeAccount(steamid));
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const removeMany = useCallback(async (steamids: string[]) => {
    if (steamids.length === 0) {
      return;
    }
    try {
      notify(await commands.removeAccounts(steamids));
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  return { remove, removeMany };
}
