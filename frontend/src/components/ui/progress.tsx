import * as React from "react";
import { cn } from "../../utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getBarColor = (pct: number) => {
      if (pct >= 75) return "from-emerald-500 to-green-400";
      if (pct >= 50) return "from-amber-500 to-yellow-400";
      if (pct >= 30) return "from-orange-500 to-amber-400";
      return "from-red-500 to-red-400";
    };

    return (
      <div
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-700 ease-out rounded-full",
            getBarColor(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
