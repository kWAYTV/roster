import {
  cloneElement,
  type MouseEventHandler,
  type ReactElement,
  type RefAttributes,
  useCallback,
  useRef,
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
  const refs = useRef<(AnimateHandle | null)[]>(
    Array.from({ length: count }, () => null)
  );

  const setRef = (index: number) => (handle: AnimateHandle | null) => {
    refs.current[index] = handle;
  };

  const start = useCallback(() => {
    for (const handle of refs.current) {
      const result = handle?.startAnimation();
      Promise.resolve(result).catch(() => undefined);
    }
  }, []);

  const stop = useCallback(() => {
    for (const handle of refs.current) {
      const result = handle?.stopAnimation();
      Promise.resolve(result).catch(() => undefined);
    }
  }, []);

  const onMouseEnter = useCallback<MouseEventHandler>(() => {
    start();
  }, [start]);

  const onMouseLeave = useCallback<MouseEventHandler>(() => {
    stop();
  }, [stop]);

  return { onMouseEnter, onMouseLeave, setRef, start, stop };
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
