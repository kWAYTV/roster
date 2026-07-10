/** Short JWT expiry label for row badges (seconds remaining; -1 = expired). */
export function formatJwtExpiry(expiresIn: number): string {
  if (expiresIn < 0) {
    return "JWT expired";
  }
  if (expiresIn === 0) {
    return "";
  }
  if (expiresIn < 3600) {
    return `JWT ${Math.max(1, Math.floor(expiresIn / 60))}m`;
  }
  if (expiresIn < 86400 * 2) {
    return `JWT ${Math.floor(expiresIn / 3600)}h`;
  }
  return "";
}
