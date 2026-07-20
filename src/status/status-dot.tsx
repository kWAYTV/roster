import { Hint } from "@/components/shared/hint";
import type { AccountStatus } from "./status";
import styles from "./status-dot.module.css";

/// A presence dot pinned to the avatar corner. Offline renders nothing.
export function StatusDot({ status }: { status?: AccountStatus }) {
  if (!status || status.state === "offline") {
    return null;
  }
  const inGame = status.state === "in-game";
  const label = inGame && status.game ? `In-game: ${status.game}` : "Online";

  return (
    <Hint label={label}>
      <span
        className={inGame ? `${styles.dot} ${styles.ingame}` : `${styles.dot} ${styles.online}`}
      />
    </Hint>
  );
}
