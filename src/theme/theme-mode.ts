export type ThemeMode = "dark" | "light" | "system";

export const THEME_MODES: readonly ThemeMode[] = ["dark", "light", "system"];

export function normalizeTheme(value: unknown): ThemeMode {
  if (value === "light" || value === "system" || value === "dark") {
    return value;
  }
  return "dark";
}

export function resolveTheme(theme: ThemeMode): "dark" | "light" {
  if (theme === "dark" || theme === "light") {
    return theme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/// Sync the document root class with the resolved appearance.
export function applyTheme(theme: ThemeMode): void {
  document.documentElement.classList.toggle(
    "dark",
    resolveTheme(theme) === "dark"
  );
}
