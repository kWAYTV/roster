import { useCallback, useState } from "react";

import { useToast } from "../feedback/toast";
import { commands } from "../platform/invoke";

/// Sign in to an account, tracking which SteamID is mid-flight.
export function useSignIn() {
  const { notify } = useToast();
  const [pending, setPending] = useState<string | null>(null);

  const signIn = useCallback(
    async (steamid: string) => {
      setPending(steamid);
      try {
        notify(await commands.signIn(steamid));
      } catch (cause) {
        notify(String(cause), "error");
      } finally {
        setPending(null);
      }
    },
    [notify]
  );

  return { pending, signIn };
}
