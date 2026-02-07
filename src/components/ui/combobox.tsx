"use client";

import type { PopoverContentProps } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/utility/classNames";

export type ComboboxProps = {
	options: {
		label: ReactNode;
		value: string | number;
	}[];
	onChange?: (value: string | number) => void;
	value?: string | number;
	className?: string;
	selectedValueFormater?: (value: string | number) => ReactNode;
	align?: PopoverContentProps["align"];
	loading?: boolean;
};
export function Combobox({
	options,
	onChange = () => undefined,
	value: initialValue,
	className,
	selectedValueFormater = (value) =>
		value
			? options.find((option) => option.value === value)?.label
			: "Select value...",
	align = "end",
	loading = false,
}: ComboboxProps) {
	if (loading) {
		return <Skeleton className={cn("h-9 w-full", className)} />;
	}
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState<string | number | undefined>(
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
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"w-fit justify-between rounded-none",
						"hover:bg-accent hover:text-accent-foreground border-border",
						"text-base bg-background dark:bg-card",
						"h-auto min-h-9.5 py-1 border-border",
						className,
					)}
				>
					<div className="w-full flex gap-3 items-center">
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
								return (
									<CommandItem
										key={optionValue}
										value={optionValue}
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
												"mr-2 h-4 w-4",
												optionValue === normalizedValue
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										<div className="w-full flex gap-3 items-center">
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
