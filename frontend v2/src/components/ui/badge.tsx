import * as React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
          {
            "bg-primary/10 text-primary border border-primary/20": variant === "default",
            "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400": variant === "success",
            "bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:text-amber-400": variant === "warning",
            "bg-red-500/10 text-red-700 border border-red-500/20 dark:text-red-400": variant === "danger",
            "bg-blue-500/10 text-blue-700 border border-blue-500/20 dark:text-blue-400": variant === "info",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
