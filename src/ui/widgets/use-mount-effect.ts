import { useEffect } from "react";

type MountEffect = () => undefined | (() => void);

/// Mount-only external sync. The only intentional `useEffect` wrapper —
/// components must never call `useEffect` directly.
export function useMountEffect(effect: MountEffect): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only by design
  useEffect(effect, []);
}
