"use client";

import { ChevronDown } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/utility/classNames";

const Accordion = AccordionPrimitive.Root;

type AccordionItemProps = ComponentPropsWithoutRef<
	typeof AccordionPrimitive.Item
>;
const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
	({ className, ...props }, ref) => (
		<AccordionPrimitive.Item
			ref={ref}
			className={cn("border-b border-border", className)}
			{...props}
		/>
	),
);
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

type AccordionTriggerProps = ComponentPropsWithoutRef<
	typeof AccordionPrimitive.Trigger
>;
const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
	({ className, children, ...props }, ref) => (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				ref={ref}
				className={cn(
					"group flex flex-1 items-center justify-between gap-3 py-4 text-left font-medium transition-colors hover:text-foreground",
					className,
				)}
				{...props}
			>
				{children}
				<ChevronDown
					size={18}
					className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
					aria-hidden="true"
				/>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	),
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

type AccordionContentProps = ComponentPropsWithoutRef<
	typeof AccordionPrimitive.Content
>;
const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
	({ className, children, ...props }, ref) => (
		<AccordionPrimitive.Content
			ref={ref}
			className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
			{...props}
		>
			<div className={cn("pb-4", className)}>{children}</div>
		</AccordionPrimitive.Content>
	),
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
