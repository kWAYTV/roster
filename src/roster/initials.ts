/// Build two-letter initials for roster avatars.
export function initialsFor(name: string): string {
  if (looksLikeSteamId(name)) {
    return "?";
  }
  const initials = [...name]
    .filter((char) => /[a-zA-Z0-9]/.test(char))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "?";
}

export function looksLikeSteamId(value: string): boolean {
  return value.length >= 16 && /^\d+$/.test(value);
}
