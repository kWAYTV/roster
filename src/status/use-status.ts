import { useEffect, useState } from "react";

import { onAccountsChanged, onAccountStatus } from "../ipc/events";
import { commands } from "../ipc/invoke";
import type { StatusMap } from "./status";

const REFRESH_INTERVAL_MS = 5 * 60_000;

/// Statuses per SteamID, streamed in as the backend sweep progresses.
/// Sweeps run on mount, after account changes, and every five minutes.
export function useStatus(): StatusMap {
  const [statuses, setStatuses] = useState<StatusMap>({});

  useEffect(() => {
    const refresh = () => {
      // Statuses are cosmetic and refresh periodically, so failures are
      // logged rather than toasted to avoid spamming the user when offline.
      commands.refreshStatuses().catch((cause) => console.error("Status refresh failed:", cause));
    };

    refresh();
    const subscriptions = [
      onAccountStatus(({ steamid, state, game }) =>
        setStatuses((current) => ({ ...current, [steamid]: { state, game } })),
      ),
      onAccountsChanged(refresh),
    ];
    const timer = setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => {
      subscriptions.forEach((subscription) => subscription.then((stop) => stop()));
      clearInterval(timer);
    };
  }, []);

  return statuses;
}
