"use client";

import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/utility/classNames";

export function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: DayPickerProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("relative p-3", className)}
			classNames={{
				months: "flex flex-col",
				month: "space-y-4",
				month_caption: "flex h-9 items-center justify-center px-9",
				caption_label: "text-sm font-medium",
				nav: "absolute inset-x-3 top-3 flex items-center justify-between",
				button_previous: cn(
					"inline-flex size-9 items-center justify-center border border-border bg-background",
					"text-muted-foreground hover:bg-accent hover:text-accent-foreground",
					"focusable disabled:pointer-events-none disabled:opacity-50",
				),
				button_next: cn(
					"inline-flex size-9 items-center justify-center border border-border bg-background",
					"text-muted-foreground hover:bg-accent hover:text-accent-foreground",
					"focusable disabled:pointer-events-none disabled:opacity-50",
				),
				month_grid: "w-full border-collapse",
				weekdays: "flex",
				weekday:
					"w-9 pb-1 text-center text-xs font-normal text-muted-foreground",
				week: "mt-1 flex w-full",
				day: "relative size-9 p-0 text-center text-sm",
				day_button: cn(
					"size-9 p-0 text-center font-normal text-foreground",
					"hover:bg-accent hover:text-accent-foreground focusable",
				),
				selected:
					"bg-primary text-primary-foreground [&>button]:bg-primary [&>button]:text-primary-foreground",
				today: "bg-accent text-accent-foreground",
				outside:
					"text-muted-foreground opacity-50 [&>button]:text-muted-foreground",
				disabled: "pointer-events-none opacity-50",
				hidden: "invisible",
				...classNames,
			}}
			components={{
				Chevron: ({ className: iconClassName, orientation }) => {
					const Icon =
						orientation === "left"
							? ChevronLeftIcon
							: orientation === "right"
								? ChevronRightIcon
								: ChevronDownIcon;
					return <Icon className={cn("size-4", iconClassName)} />;
				},
			}}
			{...props}
		/>
	);
}
