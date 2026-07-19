"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/utility/classNames";

type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;
const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
	({ className, ...props }, ref) => (
		<CheckboxPrimitive.Root
			ref={ref}
			className={cn(
				"group h-4 w-4 shrink-0 border border-border bg-background ring-offset-background",
				"data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
				"data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
				"focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
				<Check className="hidden h-3.5 w-3.5 group-data-[state=checked]:block" />
				<Minus className="hidden h-3.5 w-3.5 group-data-[state=indeterminate]:block" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	),
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
