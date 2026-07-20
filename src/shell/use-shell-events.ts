import { useEffect } from "react";

import {
  onCooldownFinished,
  onImportRequest,
  onStatus,
  onStatusError,
} from "../platform/events";

interface ShellEventsOptions {
  notify: (message: string, kind?: "ok" | "error") => void;
  openImport: (prefill?: string) => void;
}

/// Subscribe to tray/backend events for the shell lifetime.
export function useShellEvents({ notify, openImport }: ShellEventsOptions) {
  useEffect(() => {
    const subscriptions = [
      onStatus(notify),
      onStatusError((message) => notify(message, "error")),
      onCooldownFinished((names) => {
        if (names.length === 1) {
          notify(`${names[0]} ready`);
        } else {
          notify(`${names.length} accounts ready`);
        }
      }),
      onImportRequest((text) => openImport(text.trim())),
    ];
    return () => {
      for (const subscription of subscriptions) {
        subscription
          .then((stop) => {
            stop();
          })
          .catch(() => undefined);
      }
    };
  }, [notify, openImport]);
}
