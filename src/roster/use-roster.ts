import { useCallback, useEffect, useState } from "react";

import { onAccountsChanged } from "../platform/events";
import { commands } from "../platform/invoke";
import type { AccountView } from "./account";
import { initialsFor } from "./initials";

export interface ProfilePatch {
  avatar?: string;
  display_name?: string;
  steamid: string;
}

/// Load the account roster and keep it in sync with backend change events.
export function useRoster() {
  const [accounts, setAccounts] = useState<AccountView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setAccounts(await commands.listAccounts());
      setError(null);
    } catch (cause) {
      setAccounts([]);
      setError(String(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  const patchProfile = useCallback((patch: ProfilePatch) => {
    setAccounts((current) =>
      current.map((account) => {
        if (account.steamid !== patch.steamid) {
          return account;
        }
        const next = { ...account };
        if (patch.display_name) {
          next.persona_name = patch.display_name;
          next.display_name = patch.display_name;
          next.initials = initialsFor(patch.display_name);
        }
        if (patch.avatar) {
          next.avatar = patch.avatar;
        }
        return next;
      })
    );
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
    const unlisten = onAccountsChanged(() => {
      refresh().catch(() => undefined);
    });
    return () => {
      unlisten
        .then((stop) => {
          stop();
        })
        .catch(() => undefined);
    };
  }, [refresh]);

  return { accounts, error, loading, patchProfile };
}
