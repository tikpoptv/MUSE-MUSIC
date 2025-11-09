import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  // ✅ เพิ่ม class base สำหรับ border และ spacing ที่สมดุล
  "flex w-full rounded-md border border-[rgba(187,180,221,0.7)] bg-white text-gray-700 placeholder:text-gray-400 transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",

  {
    variants: {
      variant: {
        default: "shadow-sm",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      size: {
        sm: "h-9 text-sm px-3 py-2",
        default: "h-11 text-sm px-4 py-3", 
        lg: "h-12 text-base px-5 py-3.5",
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
