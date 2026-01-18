"use client";

import type { PopoverContentProps } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
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
	value?: string;
	className?: string;
	selectedValueFormater?: (value: string | number) => ReactNode;
	align?: PopoverContentProps["align"];
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
}: ComboboxProps) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(initialValue || options[0]?.value);

	const selectedOption = useMemo(
		() => options.find((option) => option.value === value),
		[options, value],
	);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"w-fit justify-between rounded-none h-[38px]",
						"hover:bg-alt hover:text-fg border-grayLight",
						"text-base bg-bg dark:bg-grayUltraLight",
						className,
					)}
				>
					<div className="w-full flex gap-3 items-center">
						{selectedOption
							? selectedValueFormater(selectedOption.value)
							: "Select value..."}
					</div>
					<ChevronsUpDown
						size={16}
						className="translate-y-[3px] ml-2 shrink-0 opacity-50"
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-fit p-0" align={align}>
				<Command>
					<CommandInput placeholder="Search..." />
					<CommandEmpty>Nothing found.</CommandEmpty>
					<CommandGroup>
						{options.map((option) => (
							<CommandItem
								key={option.value}
								value={`${option.value}`}
								onSelect={(currentValue) => {
									const newValue = currentValue === value ? "" : currentValue;
									const item = options.find(
										(item) =>
											`${item.value}`.toLocaleLowerCase() ===
											newValue.toLocaleLowerCase(),
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
										value === option.value ? "opacity-100" : "opacity-0",
									)}
								/>
								<div className="w-full flex gap-3 items-center">
									{option.label}
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
