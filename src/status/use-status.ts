import { useEffect, useRef, useState } from "react";

import { notify } from "../feedback/status";
import { onAccountStatus } from "../platform/events";
import { commands } from "../platform/invoke";
import type { ProfilePatch } from "../roster/use-roster";
import type { StatusMap } from "./status";

const REFRESH_INTERVAL_MS = 5 * 60_000;
const STARTUP_DELAY_MS = 400;

let statusFailureNotified = false;

const MIN_SWEEP_GAP_MS = 60_000;
let lastSweepAt = 0;

/// Ask the backend for a sweep. Unforced calls are dropped within a minute of
/// the last one, so tray show/hide does not hammer Steam Community.
export function refreshStatuses(force = false): void {
  const at = Date.now();
  if (!force && at - lastSweepAt < MIN_SWEEP_GAP_MS) {
    return;
  }
  lastSweepAt = at;
  commands.refreshStatuses().catch((cause) => {
    if (statusFailureNotified) {
      return;
    }
    statusFailureNotified = true;
    notify(`Status refresh failed: ${cause}`, "error");
  });
}

/// Statuses per SteamID, streamed in as the backend sweep progresses.
/// Sweeps start after the roster loads, every five minutes, when the window
/// becomes visible, and when the set of accounts changes. Metadata edits
/// (pins, notes, cooldowns) do not trigger a network sweep.
export function useStatus(
  rosterReady: boolean,
  rosterKey: string,
  onProfile?: (patch: ProfilePatch) => void
): StatusMap {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const sweptKey = useRef<string | null>(null);

  useEffect(() => {
    if (!rosterReady) {
      return;
    }
    if (sweptKey.current === null) {
      sweptKey.current = rosterKey;
      return;
    }
    if (sweptKey.current === rosterKey) {
      return;
    }
    sweptKey.current = rosterKey;
    refreshStatuses(true);
  }, [rosterKey, rosterReady]);

  useEffect(() => {
    if (!rosterReady) {
      return;
    }

    const refresh = refreshStatuses;

    const startup = window.setTimeout(() => refresh(true), STARTUP_DELAY_MS);
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
    ];
    const timer = setInterval(() => refresh(true), REFRESH_INTERVAL_MS);

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
  }, [onProfile, rosterReady]);

  return statuses;
}
