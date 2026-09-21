import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const STAGGER_WINDOW = 0.24;

let easeOut: ReturnType<typeof CustomEase.create> | null = null;

function rosterEase(): ReturnType<typeof CustomEase.create> {
  easeOut ??= CustomEase.create("roster-out", "0.23, 1, 0.32, 1");
  return easeOut;
}

export interface PlayEnterOptions {
  blur?: number;
  duration?: number;
  fade?: boolean;
  stagger?: number;
  y?: number;
}

function targetsOf(nodes: ArrayLike<Element>): Element[] {
  return Array.from(nodes);
}

/// One-shot enter. CSS transitions stay on interactive state; this is the staged sequence.
export function playEnter(
  nodes: ArrayLike<Element>,
  options: PlayEnterOptions = {}
): () => void {
  const list = targetsOf(nodes);
  if (list.length === 0) {
    return () => undefined;
  }

  const reduced = window.matchMedia(REDUCED_MOTION).matches;
  const fade = options.fade ?? true;
  const blur = options.blur ?? 0;
  const y = options.y ?? 8;
  if (reduced && !fade) {
    return () => undefined;
  }

  const preferred = options.stagger ?? 0.05;
  const each =
    reduced || list.length < 2
      ? 0
      : Math.min(preferred, STAGGER_WINDOW / (list.length - 1));

  const tween = gsap.from(list, {
    duration: reduced ? 0.15 : (options.duration ?? 0.28),
    ease: rosterEase(),
    immediateRender: true,
    overwrite: "auto",
    stagger: each,
    ...(fade ? { opacity: 0 } : {}),
    ...(reduced || blur <= 0 ? {} : { filter: `blur(${blur}px)` }),
    ...(reduced || y === 0 ? {} : { y }),
    onComplete: () => {
      gsap.set(list, { clearProps: "filter,opacity,transform" });
    },
  });

  return () => {
    tween.kill();
    gsap.set(list, { clearProps: "filter,opacity,transform" });
  };
}
