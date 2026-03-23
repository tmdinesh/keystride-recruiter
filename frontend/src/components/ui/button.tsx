import * as React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
          {
            "bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-sm hover:shadow-glow-sm hover:brightness-110 hover:-translate-y-px": variant === "default",
            "border border-input bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm hover:-translate-y-px": variant === "outline",
            "text-foreground hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "bg-gradient-to-b from-destructive to-destructive/80 text-destructive-foreground shadow-sm hover:brightness-110 hover:-translate-y-px": variant === "destructive",
            "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-sm hover:brightness-110 hover:-translate-y-px": variant === "success",
            "h-8 px-3 text-xs gap-1.5": size === "sm",
            "h-9 px-4 text-sm gap-2": size === "md",
            "h-11 px-6 text-sm gap-2": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
