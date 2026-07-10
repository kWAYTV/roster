import { useEffect, useState } from "react";

import { onAccountsChanged, onAccountStatus } from "../ipc/events";
import { commands } from "../ipc/invoke";
import type { ProfilePatch } from "../roster/use-roster";
import type { StatusMap } from "./status";

const REFRESH_INTERVAL_MS = 5 * 60_000;
const STARTUP_DELAY_MS = 400;

/// Statuses per SteamID, streamed in as the backend sweep progresses.
/// Sweeps start after the roster loads, then every five minutes.
export function useStatus(rosterReady: boolean, onProfile?: (patch: ProfilePatch) => void): StatusMap {
  const [statuses, setStatuses] = useState<StatusMap>({});

  useEffect(() => {
    if (!rosterReady) {
      return;
    }

    const refresh = () => {
      commands.refreshStatuses().catch((cause) => console.error("Status refresh failed:", cause));
    };

    const startup = window.setTimeout(refresh, STARTUP_DELAY_MS);
    const subscriptions = [
      onAccountStatus((payload) => {
        setStatuses((current) => ({
          ...current,
          [payload.steamid]: { state: payload.state, game: payload.game },
        }));
        if (onProfile && (payload.display_name || payload.avatar)) {
          onProfile({
            steamid: payload.steamid,
            display_name: payload.display_name,
            avatar: payload.avatar,
          });
        }
      }),
      onAccountsChanged(refresh),
    ];
    const timer = setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => {
      window.clearTimeout(startup);
      subscriptions.forEach((subscription) => subscription.then((stop) => stop()));
      clearInterval(timer);
    };
  }, [onProfile, rosterReady]);

  return statuses;
}
