import { Command as CommandPrimitive } from "cmdk";
import type * as React from "react";

import { CheckIcon } from "@/ui/icons/check";
import { SearchIcon } from "@/ui/icons/search";
import { cn } from "@/ui/primitives/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground",
        className
      )}
      data-slot="command"
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run…",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  children: React.ReactNode;
  className?: string;
  description?: string;
  showCloseButton?: boolean;
  title?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl p-0 sm:max-w-lg",
          className
        )}
        motion={false}
        showCloseButton={showCloseButton}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className="rounded-none">{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      className="flex items-center gap-2 border-border border-b px-3"
      data-slot="command-input-wrapper"
    >
      <SearchIcon className="opacity-50" size={16} />
      <CommandPrimitive.Input
        className={cn(
          "flex h-9 w-full bg-transparent py-2 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        data-slot="command-input"
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-y-auto overflow-x-hidden outline-none",
        className
      )}
      data-slot="command-list"
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className={cn("py-6 text-center text-sm", className)}
      data-slot="command-empty"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:text-xs",
        className
      )}
      data-slot="command-group"
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn("-mx-1 h-px bg-border", className)}
      data-slot="command-separator"
      {...props}
    />
  );
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "group/command-item relative flex cursor-default select-none items-center gap-2 in-data-[slot=dialog-content]:rounded-lg rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-selected:bg-muted data-selected:text-foreground data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-selected:*:[svg]:text-foreground",
        className
      )}
      data-slot="command-item"
      {...props}
    >
      {children}
      <CheckIcon
        className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
        size={14}
      />
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "ml-auto text-muted-foreground text-xs tracking-widest group-data-selected/command-item:text-foreground",
        className
      )}
      data-slot="command-shortcut"
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
