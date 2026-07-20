import type {
  ComponentProps,
  FocusEventHandler,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from "react";

import { ChevronRightIcon } from "@/ui/icons/chevron-right";
import {
  ContextMenuItem,
  ContextMenuSubTrigger,
} from "@/ui/primitives/context-menu";
import {
  type AnimateHandle,
  RowAnimateIcon,
  useRowIconAnimation,
} from "@/ui/widgets/row-animate-icon";

type IconNode = ReactElement<{
  size?: number;
  className?: string;
  ref?: (handle: AnimateHandle | null) => void;
}>;

export function IconItem({
  icon,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof ContextMenuItem> & {
  icon: IconNode;
  children: ReactNode;
}) {
  const anim = useRowIconAnimation(1);
  const hover = mergeHoverHandlers(anim, {
    onBlur,
    onFocus,
    onMouseEnter,
    onMouseLeave,
  });

  return (
    <ContextMenuItem {...props} {...hover}>
      <RowAnimateIcon iconRef={anim.setRef(0)}>{icon}</RowAnimateIcon>
      {children}
    </ContextMenuItem>
  );
}

export function IconSubTrigger({
  icon,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof ContextMenuSubTrigger> & {
  icon: IconNode;
}) {
  const anim = useRowIconAnimation(2);
  const hover = mergeHoverHandlers(anim, {
    onBlur,
    onFocus,
    onMouseEnter,
    onMouseLeave,
  });

  return (
    <ContextMenuSubTrigger {...props} showChevron={false} {...hover}>
      <RowAnimateIcon iconRef={anim.setRef(0)}>{icon}</RowAnimateIcon>
      {children}
      <RowAnimateIcon iconRef={anim.setRef(1)}>
        <ChevronRightIcon className="ml-auto" />
      </RowAnimateIcon>
    </ContextMenuSubTrigger>
  );
}

function mergeHoverHandlers(
  anim: ReturnType<typeof useRowIconAnimation>,
  handlers: {
    onMouseEnter?: MouseEventHandler;
    onMouseLeave?: MouseEventHandler;
    onFocus?: FocusEventHandler;
    onBlur?: FocusEventHandler;
  }
) {
  return {
    onBlur: ((event) => {
      anim.stop();
      handlers.onBlur?.(event);
    }) satisfies FocusEventHandler,
    onFocus: ((event) => {
      anim.start();
      handlers.onFocus?.(event);
    }) satisfies FocusEventHandler,
    onMouseEnter: ((event) => {
      anim.start();
      handlers.onMouseEnter?.(event);
    }) satisfies MouseEventHandler,
    onMouseLeave: ((event) => {
      anim.stop();
      handlers.onMouseLeave?.(event);
    }) satisfies MouseEventHandler,
  };
}
