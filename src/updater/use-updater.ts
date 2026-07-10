import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { useCallback, useEffect, useRef, useState } from "react";

const STARTUP_DELAY_MS = 3_000;

/// Check GitHub Releases for a signed update and install it on demand.
export function useUpdater(notify: (message: string) => void) {
  const [available, setAvailable] = useState<Update | null>(null);
  const [busy, setBusy] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const checked = useRef(false);

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
    [notify],
  );

  useEffect(() => {
    if (checked.current) {
      return;
    }
    checked.current = true;
    const timer = window.setTimeout(() => {
      void checkForUpdate();
    }, STARTUP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [checkForUpdate]);

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
    currentVersion,
    checkForUpdate,
    install,
    dismiss,
  };
}
