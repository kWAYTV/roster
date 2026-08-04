import { useEffect } from "react";

import { applyTheme, normalizeTheme, type ThemeMode } from "./theme-mode";

/// Keep `document.documentElement` in sync with the appearance preference.
export function useTheme(theme: ThemeMode | string): void {
  const mode = normalizeTheme(theme);

  useEffect(() => {
    applyTheme(mode);
    if (mode !== "system") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [mode]);
}
