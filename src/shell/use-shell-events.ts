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
  error: string | null;
}

export function useShellEvents({ notify, openImport, error }: ShellEventsOptions) {
  useEffect(() => {
    const subscriptions = [
      onStatus(notify),
      onStatusError((message) => notify(message, "error")),
      onCooldownFinished((names) => {
        if (names.length === 1) {
          notify(`${names[0]} cooldown finished.`);
        } else {
          notify(`${names.length} accounts ready.`);
        }
      }),
      onImportRequest((text) => openImport(text.trim())),
    ];
    return () => {
      subscriptions.forEach((subscription) => subscription.then((stop) => stop()));
    };
  }, [notify, openImport]);

  useEffect(() => {
    if (error) {
      notify(error, "error");
    }
  }, [error, notify]);
}
