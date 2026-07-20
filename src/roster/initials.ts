const ALPHANUMERIC = /[a-zA-Z0-9]/;
const DIGITS_ONLY = /^\d+$/;

/// Build two-letter initials for roster avatars.
export function initialsFor(name: string): string {
  if (looksLikeSteamId(name)) {
    return "?";
  }
  const initials = [...name]
    .filter((char) => ALPHANUMERIC.test(char))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "?";
}

export function looksLikeSteamId(value: string): boolean {
  return value.length >= 16 && DIGITS_ONLY.test(value);
}
