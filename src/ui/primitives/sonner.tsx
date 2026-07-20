import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { BadgeAlertIcon } from "@/ui/icons/badge-alert";
import { BanIcon } from "@/ui/icons/ban";
import { CircleCheckIcon } from "@/ui/icons/circle-check";
import { CircleHelpIcon } from "@/ui/icons/circle-help";
import { SpinningLoader } from "@/ui/widgets/spinning-loader";
import { cn } from "@/ui/primitives/cn";

const theme: ToasterProps["theme"] = document.documentElement.classList.contains(
  "dark",
)
  ? "dark"
  : "light";

const Toaster = ({ className, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
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
