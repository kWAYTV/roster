import { useCallback, useState } from "react";

import { notify } from "@/feedback/status";
import { commands } from "@/platform/invoke";

/// Import accounts from pasted text and read the clipboard on demand.
export function useImport() {
  const [busy, setBusy] = useState(false);

  const importText = useCallback(
    async (payload: string, withoutSignIn: boolean): Promise<boolean> => {
      setBusy(true);
      try {
        notify(await commands.importAccounts(payload, withoutSignIn));
        return true;
      } catch (cause) {
        notify(String(cause), "error");
        return false;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const paste = useCallback(async (): Promise<string> => {
    try {
      return await commands.readClipboard();
    } catch (cause) {
      notify(String(cause), "error");
      return "";
    }
  }, []);

  return { busy, importText, paste };
}
