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

  return (
    <section aria-label="Application log" className={styles.panel}>
      <pre className={styles.body}>
        {lines.join("\n") || "No log output yet."}
      </pre>
    </section>
  );
}
