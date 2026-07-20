import type { Transition } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/ui/primitives/cn";

export interface ListFilterIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ListFilterIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const DEFAULT_TRANSITION: Transition = {
  duration: 0.4,
  times: [0, 0.4, 1],
};

const ListFilterIcon = forwardRef<ListFilterIconHandle, ListFilterIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={controls}
            d="M3 6h18"
            transition={DEFAULT_TRANSITION}
            variants={{
              animate: { x: [0, 1, 0] },
              normal: { x: 0 },
            }}
          />
          <motion.path
            animate={controls}
            d="M7 12h10"
            transition={DEFAULT_TRANSITION}
            variants={{
              animate: { x: [0, -1, 0] },
              normal: { x: 0 },
            }}
          />
          <motion.path
            animate={controls}
            d="M10 18h4"
            transition={DEFAULT_TRANSITION}
            variants={{
              animate: { x: [0, 1, 0] },
              normal: { x: 0 },
            }}
          />
        </svg>
      </div>
    );
  }
);

ListFilterIcon.displayName = "ListFilterIcon";

export { ListFilterIcon };
