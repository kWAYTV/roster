import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { useCallback, useEffect, useState } from "react";

/// Check GitHub Releases for a signed update and install it on demand.
export function useUpdater(notify: (message: string) => void) {
  const [available, setAvailable] = useState<Update | null>(null);
  const [busy, setBusy] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);

  useEffect(() => {
    getVersion()
      .then(setCurrentVersion)
      .catch(() => setCurrentVersion(null));
  }, []);

  const checkForUpdate = useCallback(
    async (manual = false) => {
      try {
        const update = await check();
        if (update) {
          setAvailable(update);
          return;
        }
        if (manual) {
          notify("You're on the latest version.");
        }
      } catch (cause) {
        if (manual) {
          notify(`Update check failed: ${cause}`);
        }
      }
    },
    [notify]
  );

  // Run as soon as the window mounts so an update dialog can open immediately.
  useEffect(() => {
    let cancelled = false;

    const runStartupCheck = async () => {
      try {
        const update = await check();
        if (!cancelled && update) {
          setAvailable(update);
        }
      } catch {
        // Startup checks stay silent; Settings still surfaces manual failures.
      }
    };

    runStartupCheck().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const install = useCallback(async () => {
    if (!available) {
      return;
    }
    setBusy(true);
    try {
      await available.downloadAndInstall();
      await relaunch();
    } catch (cause) {
      notify(`Update failed: ${cause}`);
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
