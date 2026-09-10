import { useCallback, useState } from "react";

import type { AccountView } from "./account";

export type AccountSheetTab = "account" | "sign-in";

export interface AccountEditorTarget {
  steamid: string;
  tab: AccountSheetTab;
}

/// Owns the account detail sheet target for the roster domain.
export function useAccountEditors() {
  const [target, setTarget] = useState<AccountEditorTarget | null>(null);

  const openAccount = useCallback((account: AccountView) => {
    setTarget({ steamid: account.steamid, tab: "account" });
  }, []);

  const openOverrides = useCallback((account: AccountView) => {
    setTarget({ steamid: account.steamid, tab: "sign-in" });
  }, []);

  const close = useCallback(() => {
    setTarget(null);
  }, []);

  const setTab = useCallback((tab: AccountSheetTab) => {
    setTarget((current) => (current ? { ...current, tab } : current));
  }, []);

  return {
    close,
    openNote: openAccount,
    openOverrides,
    openTags: openAccount,
    setTab,
    target,
  };
}
