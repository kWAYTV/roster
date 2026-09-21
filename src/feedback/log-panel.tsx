import { useRef } from "react";

import { useEnterStagger } from "@/ui/widgets/use-enter-stagger";

import styles from "./log-panel.module.css";
import { useLogLines } from "./use-log-lines";

interface LogPanelProps {
  visible: boolean;
}

export function LogPanel({ visible }: LogPanelProps) {
  if (!visible) {
    return null;
  }
  return <LogPanelLive />;
}

function LogPanelLive() {
  const lines = useLogLines();
  const ref = useRef<HTMLElement>(null);
  useEnterStagger(ref, {
    duration: 0.2,
    selector: ":scope",
    stagger: 0,
    y: 6,
  });

  return (
    <section aria-label="Application log" className={styles.panel} ref={ref}>
      <pre className={styles.body}>
        {lines.join("\n") || "No log output yet."}
      </pre>
    </section>
  );
}
