import { dismissStatus, useStatusEntry } from "./status";
import styles from "./status-line.module.css";

/** Live message in the footer — fades in, click to dismiss. */
export function StatusLine() {
  const entry = useStatusEntry();

  if (!entry) {
    return <div aria-live="polite" className={styles.slot} />;
  }

  return (
    <div aria-live="polite" className={styles.slot}>
      <button
        className={
          entry.kind === "error" ? styles.messageError : styles.message
        }
        key={entry.id}
        onClick={dismissStatus}
        title={entry.message}
        type="button"
      >
        {entry.message}
      </button>
    </div>
  );
}
