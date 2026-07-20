import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { BadgeAlertIcon } from "@/ui/icons/badge-alert";
import { BanIcon } from "@/ui/icons/ban";
import { CircleCheckIcon } from "@/ui/icons/circle-check";
import { CircleHelpIcon } from "@/ui/icons/circle-help";
import { cn } from "@/ui/primitives/cn";
import { SpinningLoader } from "@/ui/widgets/spinning-loader";

const theme: ToasterProps["theme"] =
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const Toaster = ({ className, ...props }: ToasterProps) => (
  <Sonner
    className={cn("toaster group", className)}
    icons={{
      error: <BanIcon size={16} />,
      info: <CircleHelpIcon size={16} />,
      loading: <SpinningLoader size={16} />,
      success: <CircleCheckIcon size={16} />,
      warning: <BadgeAlertIcon size={16} />,
    }}
    style={
      {
        "--border-radius": "var(--radius)",
        "--normal-bg": "var(--popover)",
        "--normal-border": "var(--border)",
        "--normal-text": "var(--popover-foreground)",
      } as CSSProperties
    }
    theme={theme}
    toastOptions={{
      classNames: {
        toast: "cn-toast",
      },
    }}
    {...props}
  />
);

export { Toaster };
