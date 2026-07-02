import { useEffect, useState } from "react";

import { nowSeconds } from "./cooldown";

/// The current Unix time, re-rendered every `intervalMs` for live countdowns.
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(nowSeconds);

  useEffect(() => {
    const timer = setInterval(() => setNow(nowSeconds()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
