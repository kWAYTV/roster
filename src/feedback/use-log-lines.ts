import { useEffect, useState } from "react";

import { commands } from "../platform/invoke";

const POLL_MS = 2000;
const MAX_LINES = 80;

/// Poll backend logs while the log panel is mounted.
export function useLogLines(): string[] {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const next = await commands.getLogs();
        if (active) {
          setLines(next.slice(-MAX_LINES));
        }
      } catch {
        /* ignore poll errors */
      }
    };
    poll().catch(() => undefined);
    const timer = window.setInterval(() => {
      poll().catch(() => undefined);
    }, POLL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return lines;
}
