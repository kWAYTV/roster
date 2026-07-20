import { useEffect, useState } from "react";

import { commands } from "../platform/invoke";

export interface ClassifyHint {
  count: number;
  hint: string;
}

const EMPTY: ClassifyHint = { count: 0, hint: "" };

/// Debounced classify against the backend for a paste field.
export function useClassifyImport(
  value: string,
  enabled: boolean
): ClassifyHint {
  const [result, setResult] = useState<ClassifyHint>(EMPTY);

  useEffect(() => {
    if (!enabled) {
      setResult(EMPTY);
      return;
    }

    const payload = value.trim();
    if (!payload) {
      setResult(EMPTY);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      commands
        .classifyImport(payload)
        .then((classified) => {
          if (!active) {
            return;
          }
          setResult({
            count: classified.importable.length,
            hint: hintFor(
              classified.importable.length,
              classified.expired.length
            ),
          });
        })
        .catch(() => {
          if (active) {
            setResult(EMPTY);
          }
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [enabled, value]);

  return result;
}

function hintFor(importable: number, expired: number): string {
  if (importable && expired) {
    return `${importable} ready · ${expired} expired`;
  }
  if (expired) {
    return `${expired} expired`;
  }
  if (!importable) {
    return "No valid tokens";
  }
  return "";
}
