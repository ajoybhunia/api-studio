import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-9 rounded-md border border-border bg-muted px-2 text-sm font-medium",
          "focus:outline-none focus:ring-2 focus:ring-accent",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Select.displayName = "Select";
