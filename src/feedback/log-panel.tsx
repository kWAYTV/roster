import { useEffect, useState } from "react";

import { commands } from "../platform/invoke";
import styles from "./log-panel.module.css";

interface LogPanelProps {
  visible: boolean;
}

export function LogPanel({ visible }: LogPanelProps) {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    let active = true;
    const poll = async () => {
      try {
        const next = await commands.getLogs();
        if (active) {
          setLines(next.slice(-80));
        }
      } catch {
        /* ignore poll errors */
      }
    };
    poll();
    const timer = window.setInterval(poll, 2000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <section className={styles.panel} aria-label="Application log">
      <pre className={styles.body}>{lines.join("\n") || "No log output yet."}</pre>
    </section>
  );
}
