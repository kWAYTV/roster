import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/feedback/toast";
import { onPreferencesChanged } from "@/platform/events";
import { commands } from "@/platform/invoke";
import {
  DEFAULT_PREFERENCES,
  normalizeImportWithoutSignIn,
  type Preferences,
} from "@/preferences/preferences";
import { normalizeTheme } from "@/theme/theme-mode";

function coercePreferences(raw: Preferences): Preferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...raw,
    import_without_sign_in: normalizeImportWithoutSignIn(
      raw.import_without_sign_in
    ),
    theme: normalizeTheme(raw.theme),
  };
}

/// Load preferences and persist single-toggle changes optimistically.
export function usePreferences() {
  const { notify } = useToast();
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const load = useCallback(async () => {
    try {
      setPreferences(coercePreferences(await commands.getPreferences()));
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

  const save = useCallback(
    async (next: Preferences) => {
      setPreferences(next);
      try {
        await commands.savePreferences(next);
      } catch (cause) {
        notify(String(cause), "error");
        load();
      }
    },
    [notify, load]
  );

  const setPreference = useCallback(
    async (key: keyof Preferences, value: boolean) => {
      await save({ ...preferences, [key]: value });
    },
    [preferences, save]
  );

  const patchPreferences = useCallback(
    async (patch: Partial<Preferences>) => {
      await save({ ...preferences, ...patch });
    },
    [preferences, save]
  );

  return { patchPreferences, preferences, setPreference };
}
