import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-primary/70 bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(340_52%_46%)_68%,hsl(var(--accent))_100%)] text-primary-foreground shadow-[0_10px_18px_rgba(122,32,56,0.28)] hover:brightness-105 hover:shadow-[0_12px_24px_rgba(122,32,56,0.32)]",
        destructive:
          "border border-destructive/70 bg-[linear-gradient(135deg,hsl(var(--destructive))_0%,hsl(0_72%_62%)_100%)] text-destructive-foreground shadow-[0_10px_18px_rgba(180,44,44,0.24)] hover:brightness-105",
        outline:
          "border border-primary/25 bg-white/90 text-primary shadow-sm hover:bg-white hover:border-primary/45 hover:shadow-md",
        secondary:
          "border border-secondary/40 bg-secondary/90 text-secondary-foreground shadow-sm hover:bg-secondary",
        ghost: "text-primary hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
