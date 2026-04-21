import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-medium transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-[var(--brand-fg)] hover:brightness-110 shadow-[0_4px_20px_-4px_rgba(91,42,66,0.45)]",
        secondary:
          "bg-[var(--bg-elev)] text-[var(--fg)] border border-[var(--border)] hover:bg-[color-mix(in_srgb,var(--brand)_8%,var(--bg-elev))]",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--brand)_8%,transparent)]",
        ghost:
          "bg-transparent text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--brand)_8%,transparent)]",
        link: "text-[var(--brand)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-7 min-w-[160px]",
        sm: "h-11 px-5 text-sm",
        lg: "h-16 px-8 text-lg",
        icon: "h-11 w-11",
        full: "h-14 w-full text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
