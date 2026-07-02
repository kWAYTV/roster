import { cooldownProgress, formatRemaining, isCooldownActive } from "./cooldown";
import { useNow } from "./use-now";
import styles from "./cooldown-badge.module.css";

interface CooldownBadgeProps {
  until: number;
  duration: number;
}

/// A live countdown pill whose fill drains as the cooldown runs out.
export function CooldownBadge({ until, duration }: CooldownBadgeProps) {
  const now = useNow(30_000);

  if (!isCooldownActive(until, now)) {
    return null;
  }

  const percent = Math.round(cooldownProgress(until, duration, now) * 100);

  return (
    <span
      className={styles.badge}
      style={{
        background: `linear-gradient(to right, var(--danger-soft) ${percent}%, transparent ${percent}%)`,
      }}
      title={`Cooldown ends ${new Date(until * 1000).toLocaleString()}`}
    >
      CD {formatRemaining(until, now)}
    </span>
  );
}
