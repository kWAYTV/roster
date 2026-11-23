import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type * as React from "react";
import { XIcon } from "@/ui/icons/x";
import { Button } from "@/ui/primitives/button";
import { cn } from "@/ui/primitives/cn";
import { EnterStagger } from "@/ui/widgets/enter-stagger";

type DialogSize = "sm" | "md" | "lg";

const DIALOG_WIDTH: Record<DialogSize, string> = {
  lg: "max-w-[480px]",
  md: "max-w-[420px]",
  sm: "max-w-[340px]",
};

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  motion = true,
  ...props
}: DialogPrimitive.Backdrop.Props & {
  motion?: boolean;
}) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-[var(--z-overlay)] bg-black/60",
        motion &&
          "data-open:fade-in-0 data-closed:fade-out-0 duration-150 data-closed:animate-out data-open:animate-in",
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = "md",
  motion = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  motion?: boolean;
  showCloseButton?: boolean;
  size?: DialogSize;
}) {
  return (
    <DialogPortal>
      <DialogOverlay motion={motion} />
      <DialogPrimitive.Popup
        className={cn(
          "fixed top-1/2 left-1/2 z-[calc(var(--z-overlay)+1)] grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[10px] border border-border bg-popover p-4 text-popover-foreground text-sm shadow-xl outline-none",
          motion &&
            "data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 duration-200 data-closed:animate-out data-open:animate-in",
          DIALOG_WIDTH[size],
          className
        )}
        data-size={size}
        data-slot="dialog-content"
        {...props}
      >
        {motion ? (
          <EnterStagger
            className="contents"
            duration={0.2}
            fade={false}
            stagger={0.04}
            y={6}
          >
            {children}
          </EnterStagger>
        ) : (
          children
        )}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                className="absolute top-3 right-3"
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <XIcon size={16} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 pr-8", className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-h-0 flex-col gap-3", className)}
      data-slot="dialog-body"
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      className={cn(
        "-mx-4 -mb-4 flex flex-row items-center justify-end gap-2 border-border border-t px-4 py-3",
        className
      )}
      data-slot="dialog-footer"
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      ) : null}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-balance font-heading font-medium text-md leading-5",
        className
      )}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      className={cn(
        "text-pretty text-muted-foreground text-sm leading-[18px] *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
