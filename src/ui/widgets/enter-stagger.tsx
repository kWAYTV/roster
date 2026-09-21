import type { ReactNode } from "react";
import { useRef } from "react";

import { useEnterStagger } from "@/ui/widgets/use-enter-stagger";

interface EnterStaggerProps {
  blur?: number;
  children: ReactNode;
  className?: string;
  duration?: number;
  fade?: boolean;
  once?: string;
  selector?: string;
  stagger?: number;
  y?: number;
}

export function EnterStagger({
  blur,
  children,
  className,
  duration,
  fade,
  once,
  selector,
  stagger,
  y,
}: EnterStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEnterStagger(ref, {
    blur,
    duration,
    fade,
    once,
    selector,
    stagger,
    y,
  });

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
}
