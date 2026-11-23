import { useEffect } from "react";

import { notify } from "../feedback/status";
import { looksLikeImport } from "../intake/looks-like-import";
import {
  onCooldownFinished,
  onImportRequest,
  onStatus,
  onStatusError,
} from "../platform/events";

interface ShellEventsOptions {
  openImport: (prefill?: string) => void;
}

/// Subscribe to tray/backend events for the shell lifetime.
export function useShellEvents({ openImport }: ShellEventsOptions) {
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
      // Only seed the dialog with clipboard text that actually carries a token.
      onImportRequest((text) =>
        openImport(looksLikeImport(text) ? text.trim() : "")
      ),
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
  }, [openImport]);
}
