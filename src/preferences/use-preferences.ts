import { useCallback, useEffect, useState } from "react";

import { useToast } from "../feedback/toast";
import { onPreferencesChanged } from "../ipc/events";
import { commands } from "../ipc/invoke";
import { DEFAULT_PREFERENCES, type Preferences } from "./preferences";

/// Load preferences and persist single-toggle changes optimistically.
export function usePreferences() {
  const { notify } = useToast();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  const load = useCallback(async () => {
    try {
      setPreferences(await commands.getPreferences());
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, [notify]);

  useEffect(() => {
    load();
    const unlisten = onPreferencesChanged(load);
    return () => {
      unlisten.then((stop) => stop());
    };
  }, [load]);

  const setPreference = useCallback(
    async (key: keyof Preferences, value: boolean) => {
      const next = { ...preferences, [key]: value };
      setPreferences(next);
      try {
        await commands.savePreferences(next);
      } catch (cause) {
        notify(String(cause), "error");
        load();
      }
    },
    [preferences, notify, load],
  );

  return { preferences, setPreference };
}
