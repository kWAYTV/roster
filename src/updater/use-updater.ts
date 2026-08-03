import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { useCallback, useState } from "react";

import { useMountEffect } from "../ui/use-mount-effect";

/// Check GitHub Releases for a signed update and install it automatically.
export function useUpdater(
  notify: (message: string, kind?: "ok" | "error") => void
) {
  const [busy, setBusy] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);

  const installUpdate = useCallback(
    async (update: Update) => {
      setBusy(true);
      notify(`Updating to ${update.version}…`);
      try {
        await update.downloadAndInstall();
        await relaunch();
      } catch {
        notify("Update failed", "error");
        setBusy(false);
      }
    },
    [notify]
  );

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
        await installUpdate(update);
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
      if (busy) {
        return;
      }
      if (manual) {
        setBusy(true);
      }
      try {
        const update = await check();
        if (update) {
          await installUpdate(update);
          return;
        }
        if (manual) {
          notify("Up to date");
          setBusy(false);
        }
      } catch {
        if (manual) {
          notify("Update check failed", "error");
          setBusy(false);
        }
      }
    },
    [busy, installUpdate, notify]
  );

  return {
    busy,
    checkForUpdate,
    currentVersion,
  };
}
