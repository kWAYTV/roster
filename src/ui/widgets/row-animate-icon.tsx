import {
  cloneElement,
  useRef,
  type MouseEventHandler,
  type ReactElement,
  type RefAttributes,
} from "react";

export interface AnimateHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type AnimIconElement = ReactElement<
  { size?: number; className?: string } & RefAttributes<AnimateHandle>
>;

/** Controlled lucide-animated icon + hover handlers for the parent row. */
export function useRowIconAnimation(count = 1) {
  const refs = useRef<(AnimateHandle | null)[]>(Array.from({ length: count }, () => null));

  const setRef = (index: number) => (handle: AnimateHandle | null) => {
    refs.current[index] = handle;
  };

  const start = () => {
    for (const handle of refs.current) {
      void handle?.startAnimation();
    }
  };

  const stop = () => {
    for (const handle of refs.current) {
      void handle?.stopAnimation();
    }
  };

  const onMouseEnter: MouseEventHandler = () => start();
  const onMouseLeave: MouseEventHandler = () => stop();

  return { setRef, start, stop, onMouseEnter, onMouseLeave };
}

export function RowAnimateIcon({
  children,
  iconRef,
  size = 16,
}: {
  children: AnimIconElement;
  iconRef: (handle: AnimateHandle | null) => void;
  size?: number;
}) {
  return cloneElement(children, { ref: iconRef, size });
}
