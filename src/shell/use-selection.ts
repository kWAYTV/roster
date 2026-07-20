import { useCallback, useState } from "react";

import type { AccountView } from "../roster/account";

export function useSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const selectAccount = useCallback(
    (account: AccountView, additive: boolean) => {
      setSelectedIds((current) => {
        const next = additive ? new Set(current) : new Set<string>();
        if (additive && current.has(account.steamid)) {
          next.delete(account.steamid);
        } else {
          next.add(account.steamid);
        }
        return next;
      });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return { clearSelection, selectAccount, selectedIds };
}
