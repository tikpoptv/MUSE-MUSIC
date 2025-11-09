import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Match border and style with SelectTrigger
const inputVariants = cva(
  "flex h-9 w-full items-center justify-between rounded-md border border-[rgba(187,180,221,0.7)] bg-white px-3 py-2 text-sm text-gray-700 ring-offset-background placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-9 text-sm",
        default: "h-10 text-sm",
        lg: "h-11 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(inputVariants({ size, className }))}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
