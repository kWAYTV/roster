/// Relative "last signed in" label for the account row. `timestamp` is Unix seconds.
export function formatLastUsed(timestamp: number): string {
  if (timestamp <= 0) {
    return "";
  }
  const elapsed = Math.floor(Date.now() / 1000) - timestamp;
  if (elapsed < 60) {
    return "just now";
  }
  if (elapsed < 3600) {
    return `${Math.floor(elapsed / 60)}m ago`;
  }
  if (elapsed < 86400) {
    return `${Math.floor(elapsed / 3600)}h ago`;
  }
  if (elapsed < 86400 * 30) {
    return `${Math.floor(elapsed / 86400)}d ago`;
  }
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
