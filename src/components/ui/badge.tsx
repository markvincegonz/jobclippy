import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xs border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary-focus",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white hover:bg-primary-hover",
        secondary:
          "border-hairline bg-surface-2 text-ink-muted",
        destructive:
          "border-destructive/20 bg-destructive/15 text-destructive",
        outline: "text-ink border-hairline bg-transparent",
        salary:
          "border-hairline bg-surface-2 text-semantic-success font-medium",
        skill:
          "border-hairline bg-surface-2 text-ink-subtle font-normal",
        stage:
          "border-hairline bg-surface-2 text-ink-muted font-medium",
        status:
          "border-hairline bg-surface-2 text-ink-muted font-normal rounded-full",
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
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
