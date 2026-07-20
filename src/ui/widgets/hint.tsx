import type { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/primitives/tooltip";

type Side = "top" | "bottom" | "left" | "right";

interface HintProps {
  label: string;
  children: ReactElement;
  side?: Side;
}

/** Tooltip wrapper for icon buttons and badges. */
export function Hint({ label, children, side = "top" }: HintProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
