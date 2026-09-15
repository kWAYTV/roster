import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useCallback } from "react";

import { Button } from "@/ui/primitives/button";
import { Hint } from "@/ui/widgets/hint";
import {
  type AnimateHandle,
  RowAnimateIcon,
  useRowIconAnimation,
} from "@/ui/widgets/row-animate-icon";

type IconNode = ReactElement<{
  className?: string;
  ref?: (handle: AnimateHandle | null) => void;
  size?: number;
}>;

type IconActionProps = Omit<ComponentProps<typeof Button>, "aria-label"> & {
  icon: IconNode;
  iconSize?: number;
  label: string;
};

/** Icon button (or labeled button) that plays the glyph animation on the full hit area. */
export function IconAction({
  icon,
  iconSize = 16,
  label,
  children,
  onMouseEnter,
  onMouseLeave,
  type = "button",
  ...props
}: IconActionProps) {
  const anim = useRowIconAnimation(1);
  const labeled = isLabeled(children);
  const handleMouseEnter = useCallback(
    (event: Parameters<NonNullable<IconActionProps["onMouseEnter"]>>[0]) => {
      anim.start();
      onMouseEnter?.(event);
    },
    [anim.start, onMouseEnter]
  );
  const handleMouseLeave = useCallback(
    (event: Parameters<NonNullable<IconActionProps["onMouseLeave"]>>[0]) => {
      anim.stop();
      onMouseLeave?.(event);
    },
    [anim.stop, onMouseLeave]
  );
  const button = (
    <Button
      type={type}
      {...props}
      aria-label={labeled ? undefined : label}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <RowAnimateIcon iconRef={anim.setRef(0)} size={iconSize}>
        {icon}
      </RowAnimateIcon>
      {children}
    </Button>
  );

  if (labeled) {
    return button;
  }

  return <Hint label={label}>{button}</Hint>;
}

function isLabeled(children: ReactNode): boolean {
  if (children === null || children === undefined || children === false) {
    return false;
  }
  if (typeof children === "string" && children.trim() === "") {
    return false;
  }
  return true;
}
