import { useCallback, useState } from "react";

import { notify } from "../feedback/status";
import { commands } from "../platform/invoke";
import { refreshStatuses } from "../status/use-status";

/// Steam Community takes a moment to reflect a fresh sign-in.
const PRESENCE_SETTLE_MS = 20_000;

/// Sign in to an account, tracking which SteamID is mid-flight.
export function useSignIn() {
  const [pending, setPending] = useState<string | null>(null);

  const signIn = useCallback(
    async (steamid: string, forceInvisible = false) => {
      setPending(steamid);
      try {
        notify(await commands.signIn(steamid, forceInvisible));
        window.setTimeout(() => refreshStatuses(true), PRESENCE_SETTLE_MS);
      } catch (cause) {
        notify(String(cause), "error");
      } finally {
        setPending(null);
      }
    },
    []
  );

  return { pending, signIn };
}
