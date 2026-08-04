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
              classified.expired.length,
              classified.new_count,
              classified.update_count
            ),
          });
        })
        .catch(() => {
          if (!active) {
            return;
          }
          setResult(EMPTY);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [enabled, value]);

  return result;
}

function hintFor(
  importable: number,
  expired: number,
  newCount: number,
  updateCount: number
): string {
  if (!(importable || expired)) {
    return "No valid tokens";
  }
  const parts: string[] = [];
  if (importable) {
    const breakdown =
      newCount || updateCount
        ? `${newCount} new · ${updateCount} update`
        : `${importable} ready`;
    parts.push(breakdown);
  }
  if (expired) {
    parts.push(`${expired} expired`);
  }
  return parts.join(" · ");
}
