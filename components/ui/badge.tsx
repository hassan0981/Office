import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-terracotta-500 text-white shadow",
        todo: "border-cream-300 bg-cream-200 text-charcoal-700",
        inProgress: "border-amber-200 bg-amber-100/80 text-amber-800",
        done: "border-emerald-200 bg-emerald-100/80 text-emerald-800",
        low: "border-sage-200 bg-sage-100/80 text-sage-700",
        medium: "border-amber-200 bg-amber-100/80 text-amber-800",
        high: "border-terracotta-200 bg-terracotta-100/80 text-terracotta-700",
        secondary: "border-transparent bg-cream-200 text-charcoal-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
