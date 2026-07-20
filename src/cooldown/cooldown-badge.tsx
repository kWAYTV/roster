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

/// A live countdown pill whose fill drains as the cooldown runs out.
export function CooldownBadge({ until, duration }: CooldownBadgeProps) {
  // The label shows whole seconds under a minute, so tick every second once
  // the countdown gets close; a 30s cadence is enough before that.
  const now = useNow(until - nowSeconds() < 90 ? 1000 : 30_000);

  if (!isCooldownActive(until, now)) {
    return null;
  }

  const percent = Math.round(cooldownProgress(until, duration, now) * 100);

  return (
    <Hint label={`Cooldown ends ${new Date(until * 1000).toLocaleString()}`}>
      <span
        className={styles.badge}
        style={{
          background: `linear-gradient(to right, var(--danger-soft) ${percent}%, transparent ${percent}%)`,
        }}
      >
        CD {formatRemaining(until, now)}
      </span>
    </Hint>
  );
}
