import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-mono text-eyebrow uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "bg-ink/5 text-ink-soft",
        accent: "bg-accent-soft text-accent-deep",
        gold: "bg-gold/10 text-gold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
