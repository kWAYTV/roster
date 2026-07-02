import { useCallback } from "react";

import { useToast } from "../feedback/toast";
import { commands } from "../ipc/invoke";

/// Clear all local Steam login data on this machine.
export function useReset() {
  const { notify } = useToast();

  const reset = useCallback(async () => {
    try {
      notify(await commands.clearCache());
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, [notify]);

  return { reset };
}
