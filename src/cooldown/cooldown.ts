/// Cooldown math shared by the badge and the menu. All times are Unix seconds.

export interface CooldownPreset {
  label: string;
  seconds: number;
}

export const COOLDOWN_PRESETS: CooldownPreset[] = [
  { label: "30 minutes", seconds: 30 * 60 },
  { label: "20 hours", seconds: 20 * 3600 },
  { label: "7 days", seconds: 7 * 86_400 },
  { label: "31 days", seconds: 31 * 86_400 },
  { label: "181 days", seconds: 181 * 86_400 },
];

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function isCooldownActive(until: number, now = nowSeconds()): boolean {
  return until > now;
}

/// Compact remaining time: "45s", "12m", "3h 20m", "31d".
export function formatRemaining(until: number, now = nowSeconds()): string {
  const remaining = until - now;
  if (remaining <= 0) {
    return "";
  }
  if (remaining < 60) {
    return `${remaining}s`;
  }
  if (remaining < 3600) {
    return `${Math.floor(remaining / 60)}m`;
  }
  if (remaining < 86_400 * 2) {
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${Math.floor(remaining / 86_400)}d`;
}

/// Fraction of the cooldown still remaining, clamped to 0..1.
export function cooldownProgress(
  until: number,
  duration: number,
  now = nowSeconds()
): number {
  if (until <= 0 || duration <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, (until - now) / duration));
}
