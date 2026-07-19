"use client";

import type { PopoverContentProps } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utility/classNames";

export type ComboboxProps<TData> = {
	id?: string;
	options: {
		label: ReactNode;
		value: TData;
		searchValue?: string;
	}[];
	onChange?: (value: TData) => void;
	value?: TData;
	className?: string;
	selectedValueFormater?: (value: TData) => ReactNode;
	align?: PopoverContentProps["align"];
	loading?: boolean;
	disabled?: boolean;
	"aria-label"?: string;
	"aria-describedby"?: string;
};
export function Combobox<TData>({
	id,
	options,
	onChange = () => undefined,
	value: initialValue,
	className,
	selectedValueFormater = (value) =>
		options.find((option) => String(option.value) === String(value))?.label ??
		"Select value...",
	align = "end",
	loading = false,
	disabled = false,
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedBy,
}: ComboboxProps<TData>) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState<TData | undefined>(
		initialValue ?? options[0]?.value,
	);

	useEffect(() => {
		if (initialValue === undefined) return;
		setValue(initialValue);
	}, [initialValue]);

	const normalizedValue = value === undefined ? "" : String(value);
	const selectedOption = useMemo(
		() => options.find((option) => String(option.value) === normalizedValue),
		[options, normalizedValue],
	);
	if (loading) {
		return <Skeleton className={cn("h-9.5 w-full", className)} />;
	}
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-label={ariaLabel}
					aria-describedby={ariaDescribedBy}
					disabled={disabled}
					className={cn(
						"w-fit justify-between rounded-none",
						"hover:bg-accent hover:text-accent-foreground border-border",
						"text-base bg-background dark:bg-card",
						"h-9 py-1 border-border pl-3",
						className,
					)}
				>
					<div className="w-full flex gap-2 items-center">
						{selectedOption
							? selectedValueFormater(selectedOption.value)
							: "Select value..."}
					</div>
					<ChevronsUpDown size={16} className="ml-2 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-fit p-0" align={align}>
				<Command>
					<CommandInput placeholder="Search..." />
					<CommandList>
						<CommandEmpty>Nothing found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const optionValue = String(option.value);
								const searchValue =
									option.searchValue ??
									(typeof option.label === "string" ? option.label : undefined);
								return (
									<CommandItem
										key={optionValue}
										value={optionValue}
										keywords={searchValue ? [searchValue] : undefined}
										onSelect={() => {
											const item = options.find(
												(item) => String(item.value) === optionValue,
											);
											if (!item) return;
											setValue(item.value);
											onChange(item.value);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												"size-5",
												optionValue === normalizedValue
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										<div className="w-full flex gap-2 items-center">
											{option.label}
										</div>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
