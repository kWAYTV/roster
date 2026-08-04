import { useCallback } from "react";

import { notify } from "../feedback/status";
import { commands } from "../platform/invoke";

/// Clear all local Steam login data on this machine.
export function useReset() {
  const reset = useCallback(async () => {
    try {
      notify(await commands.clearCache());
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  return { reset };
}
