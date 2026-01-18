import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/utility/classNames";

const badgeVariants = cva(
	cn(
		"inline-flex items-center gap-1.5 rounded-full border",
		"px-2.5 pt-1 pb-0.5 text-xs transition-colors focusable",
	),
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline: "text-foreground hover:bg-accent hover:text-accent-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}
