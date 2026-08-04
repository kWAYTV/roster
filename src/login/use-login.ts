import { useCallback, useState } from "react";

import { notify } from "../feedback/status";
import { commands } from "../platform/invoke";

/// Sign in to an account, tracking which SteamID is mid-flight.
export function useSignIn() {
  const [pending, setPending] = useState<string | null>(null);

  const signIn = useCallback(
    async (steamid: string, forceInvisible = false) => {
      setPending(steamid);
      try {
        notify(await commands.signIn(steamid, forceInvisible));
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
