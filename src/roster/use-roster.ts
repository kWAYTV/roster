import { useCallback, useEffect, useState } from "react";

import { onAccountsChanged } from "../ipc/events";
import { commands } from "../ipc/invoke";
import type { AccountView } from "./account";

/// Load the account roster and keep it in sync with backend change events.
export function useRoster() {
  const [accounts, setAccounts] = useState<AccountView[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setAccounts(await commands.listAccounts());
      setError(null);
    } catch (cause) {
      setAccounts([]);
      setError(String(cause));
    }
  }, []);

  useEffect(() => {
    refresh();
    const unlisten = onAccountsChanged(refresh);
    return () => {
      unlisten.then((stop) => stop());
    };
  }, [refresh]);

  return { accounts, error };
}
