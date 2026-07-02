import { useCallback } from "react";

import { useToast } from "../feedback/toast";
import { commands } from "../ipc/invoke";

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

  return { remove };
}
