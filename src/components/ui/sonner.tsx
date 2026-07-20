import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { BadgeAlertIcon } from "@/components/icons/badge-alert";
import { BanIcon } from "@/components/icons/ban";
import { CircleCheckIcon } from "@/components/icons/circle-check";
import { CircleHelpIcon } from "@/components/icons/circle-help";
import { SpinningLoader } from "@/components/shared/spinning-loader";
import { cn } from "@/lib/utils";

const Toaster = ({ className, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className={cn("toaster group", className)}
      icons={{
        success: <CircleCheckIcon size={16} />,
        info: <CircleHelpIcon size={16} />,
        warning: <BadgeAlertIcon size={16} />,
        error: <BanIcon size={16} />,
        loading: <SpinningLoader size={16} />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
