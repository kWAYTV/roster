import { Hint } from "@/ui/widgets/hint";
import {
  cooldownProgress,
  formatRemaining,
  isCooldownActive,
  nowSeconds,
} from "./cooldown";
import styles from "./cooldown-badge.module.css";
import { useNow } from "./use-now";

interface CooldownBadgeProps {
  duration: number;
  until: number;
}

/// A live countdown badge whose fill drains as the cooldown runs out.
export function CooldownBadge({ until, duration }: CooldownBadgeProps) {
  const now = useNow(until - nowSeconds() < 90 ? 1000 : 30_000);

  if (!isCooldownActive(until, now)) {
    return null;
  }

  const remaining = cooldownProgress(until, duration, now);

  return (
    <Hint label={`Cooldown ends ${new Date(until * 1000).toLocaleString()}`}>
      <span className={styles.badge}>
        {formatRemaining(until, now)}
        <span aria-hidden="true" className={styles.track}>
          <span
            className={styles.fill}
            style={{ transform: `scaleX(${remaining})` }}
          />
        </span>
      </span>
    </Hint>
  );
}
