import { useCallback, useState } from "react";

import { useToast } from "../feedback/toast";
import { commands } from "../platform/invoke";

/// Import accounts from pasted text and read the clipboard on demand.
export function useImport() {
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);

  const importText = useCallback(
    async (payload: string): Promise<boolean> => {
      setBusy(true);
      try {
        notify(await commands.importAccounts(payload));
        return true;
      } catch (cause) {
        notify(String(cause), "error");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [notify],
  );

  const paste = useCallback(async (): Promise<string> => {
    try {
      return await commands.readClipboard();
    } catch (cause) {
      notify(String(cause), "error");
      return "";
    }
  }, [notify]);

  return { importText, paste, busy };
}
