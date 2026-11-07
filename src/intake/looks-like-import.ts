const JWT = /ey[A-Za-z0-9_=-]{8,}\.[A-Za-z0-9_=-]{8,}\.[A-Za-z0-9_=-]{8,}/;

/// Cheap clipboard sniff. Backend classify still decides what is importable.
export function looksLikeImport(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 200_000) {
    return false;
  }
  if (JWT.test(trimmed)) {
    return true;
  }
  return JWT.test(trimmed.replace(/\s+/g, ""));
}
