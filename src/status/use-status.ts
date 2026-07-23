import { useEffect, useState } from "react";

import { useToast } from "../feedback/toast";
import { onAccountStatus, onAccountsChanged } from "../platform/events";
import { commands } from "../platform/invoke";
import type { ProfilePatch } from "../roster/use-roster";
import type { StatusMap } from "./status";

const REFRESH_INTERVAL_MS = 5 * 60_000;
const STARTUP_DELAY_MS = 400;

let statusFailureNotified = false;

/// Statuses per SteamID, streamed in as the backend sweep progresses.
/// Sweeps start after the roster loads, then every five minutes.
export function useStatus(
  rosterReady: boolean,
  onProfile?: (patch: ProfilePatch) => void
): StatusMap {
  const { notify } = useToast();
  const [statuses, setStatuses] = useState<StatusMap>({});

  useEffect(() => {
    if (!rosterReady) {
      return;
    }

    const refresh = () => {
      commands.refreshStatuses().catch((cause) => {
        if (statusFailureNotified) {
          return;
        }
        statusFailureNotified = true;
        notify(`Status refresh failed: ${cause}`, "error");
      });
    };

    const startup = window.setTimeout(refresh, STARTUP_DELAY_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    const subscriptions = [
      onAccountStatus((payload) => {
        setStatuses((current) => ({
          ...current,
          [payload.steamid]: { game: payload.game, state: payload.state },
        }));
        if (!onProfile) {
          return;
        }
        if (!(payload.display_name || payload.avatar)) {
          return;
        }
        onProfile({
          avatar: payload.avatar,
          display_name: payload.display_name,
          steamid: payload.steamid,
        });
      }),
      onAccountsChanged(refresh),
    ];
    const timer = setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => {
      window.clearTimeout(startup);
      document.removeEventListener("visibilitychange", onVisibility);
      for (const subscription of subscriptions) {
        subscription
          .then((stop) => {
            stop();
          })
          .catch(() => undefined);
      }
      clearInterval(timer);
    };
  }, [notify, onProfile, rosterReady]);

  return statuses;
}
