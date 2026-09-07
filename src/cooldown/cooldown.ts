/// Cooldown math shared by the badge and the menu. All times are Unix seconds.

export interface CooldownPreset {
  label: string;
  seconds: number;
}

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
export const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

export const COOLDOWN_PRESETS: CooldownPreset[] = [
  { label: "30 minutes", seconds: 30 * SECONDS_PER_MINUTE },
  { label: "20 hours", seconds: 20 * SECONDS_PER_HOUR },
  { label: "7 days", seconds: 7 * SECONDS_PER_DAY },
  { label: "31 days", seconds: 31 * SECONDS_PER_DAY },
  { label: "181 days", seconds: 181 * SECONDS_PER_DAY },
];

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
}

export function splitDuration(seconds: number): DurationParts {
  const total = Math.max(0, Math.floor(seconds));
  return {
    days: Math.floor(total / SECONDS_PER_DAY),
    hours: Math.floor((total % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
  };
}

export function joinDuration({ days, hours, minutes }: DurationParts): number {
  return (
    days * SECONDS_PER_DAY +
    hours * SECONDS_PER_HOUR +
    minutes * SECONDS_PER_MINUTE
  );
}

/// Full breakdown: "1d 12h 30m", "45m", "2d".
export function formatDuration(seconds: number): string {
  const { days, hours, minutes } = splitDuration(seconds);
  const parts: string[] = [];
  if (days) {
    parts.push(`${days}d`);
  }
  if (hours) {
    parts.push(`${hours}h`);
  }
  if (minutes) {
    parts.push(`${minutes}m`);
  }
  return parts.join(" ");
}

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
