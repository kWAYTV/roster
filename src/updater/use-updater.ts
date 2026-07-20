import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { useCallback, useState } from "react";

import { useMountEffect } from "../ui/use-mount-effect";

/// Check GitHub Releases for a signed update and install it on demand.
export function useUpdater(notify: (message: string) => void) {
  const [available, setAvailable] = useState<Update | null>(null);
  const [busy, setBusy] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);

  useMountEffect(() => {
    let cancelled = false;

    getVersion()
      .then(setCurrentVersion)
      .catch(() => setCurrentVersion(null));

    const runStartupCheck = async () => {
      try {
        const update = await check();
        if (cancelled || !update) {
          return;
        }
        setAvailable(update);
      } catch {
        // Startup checks stay silent; Settings still surfaces manual failures.
      }
    };

    runStartupCheck().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  });

  const checkForUpdate = useCallback(
    async (manual = false) => {
      try {
        const update = await check();
        if (update) {
          setAvailable(update);
          return;
        }
        if (manual) {
          notify("Up to date");
        }
      } catch {
        if (manual) {
          notify("Update check failed");
        }
      }
    },
    [notify]
  );

  const install = useCallback(async () => {
    if (!available) {
      return;
    }
    setBusy(true);
    try {
      await available.downloadAndInstall();
      await relaunch();
    } catch {
      notify("Update failed");
      setBusy(false);
    }
  }, [available, notify]);

  const dismiss = useCallback(() => {
    setAvailable(null);
  }, []);

  return {
    available,
    busy,
    checkForUpdate,
    currentVersion,
    dismiss,
    install,
  };
}
