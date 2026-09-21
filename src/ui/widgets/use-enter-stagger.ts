import { type RefObject, useLayoutEffect } from "react";

import { type PlayEnterOptions, playEnter } from "@/ui/widgets/play-enter";

const STRICT_REMOUNT_MS = 80;
const claimedAt = new Map<string, number>();

function claimOnce(key: string): boolean {
  const now = performance.now();
  const at = claimedAt.get(key);
  if (at !== undefined && now - at > STRICT_REMOUNT_MS) {
    return false;
  }
  claimedAt.set(key, now);
  return true;
}

function releaseOnce(key: string): void {
  const at = claimedAt.get(key);
  if (at !== undefined && performance.now() - at < STRICT_REMOUNT_MS) {
    claimedAt.delete(key);
  }
}

export interface EnterStaggerOptions extends PlayEnterOptions {
  once?: string;
  selector?: string;
}

function collect(root: HTMLElement, selector: string | undefined): Element[] {
  if (selector === ":scope") {
    return [root];
  }
  if (selector) {
    return Array.from(root.querySelectorAll(selector));
  }
  return Array.from(root.children);
}

/// Mount-time GSAP enter. Lives in a hook so components never call effects directly.
export function useEnterStagger(
  ref: RefObject<HTMLElement | null>,
  options: EnterStaggerOptions
): void {
  const {
    blur = 0,
    duration = 0.28,
    fade = true,
    once,
    selector,
    stagger = 0.05,
    y = 8,
  } = options;

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    if (once && !claimOnce(once)) {
      return;
    }
    const stop = playEnter(collect(root, selector), {
      blur,
      duration,
      fade,
      stagger,
      y,
    });
    return () => {
      stop();
      if (once) {
        releaseOnce(once);
      }
    };
  }, [blur, duration, fade, once, ref, selector, stagger, y]);
}
