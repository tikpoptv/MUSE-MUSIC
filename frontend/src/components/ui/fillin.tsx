import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define style variants for Input (changed to violet theme)
const inputVariants = cva(

  {
    variants: {
      variant: {
       default: "bg-background border-input text-foreground shadow-xs",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      size: {
        default: " h-10 px-3 py-2",
        sm: " h-8 px-2 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };