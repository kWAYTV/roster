/**
 * Adjust a snapshot `jwt_expires_in` from list time so badges expire live
 * without waiting for another roster refresh.
 */
export function liveJwtExpiresIn(
  expiresIn: number,
  listedAtSeconds: number,
  nowSeconds: number
): number {
  if (expiresIn === 0) {
    return 0;
  }
  if (expiresIn < 0) {
    return -1;
  }
  if (listedAtSeconds <= 0) {
    return expiresIn;
  }
  const remaining = expiresIn - (nowSeconds - listedAtSeconds);
  return remaining > 0 ? remaining : -1;
}

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
  if (expiresIn < 86_400 * 2) {
    return `JWT ${Math.floor(expiresIn / 3600)}h`;
  }
  if (expiresIn < 86_400 * 14) {
    return `JWT ${Math.floor(expiresIn / 86_400)}d`;
  }
  return "";
}

/** Absolute expiry tooltip; empty when unknown. */
export function jwtExpiryTooltip(expiresIn: number): string {
  if (expiresIn === 0) {
    return "";
  }
  if (expiresIn < 0) {
    return "Refresh token expired — re-import to sign in.";
  }
  const at = new Date(Date.now() + expiresIn * 1000);
  return `Token expires ${at.toLocaleString()}`;
}
