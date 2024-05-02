"use client";

import { Check, ChevronDown, X } from "lucide-react";

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
import { type ReactNode, useCallback, useState } from "react";
import { IconBadge } from "./icon-badge";

type OptionType<OptionValueType extends string = string> = {
	label: ReactNode;
	value: OptionValueType;
};

type MultiValueInputProps<OptionValueType extends string = string> = {
	options: OptionType<OptionValueType>[];
	onChange?: (newOptions: OptionType<OptionValueType>[]) => void;
	values?: OptionValueType[];
	className?: string;
	placeholder?: string;
	selectedValueFormater?: (value: OptionValueType) => ReactNode;
};

export function MultiValueInput<OptionValueType extends string = string>({
	options,
	onChange = () => undefined,
	values: initialValues = [],
	className,
	placeholder = "Select options",
	selectedValueFormater = getDefaultValueFormatter(options),
}: MultiValueInputProps<OptionValueType>) {
	const [open, setOpen] = useState(false);
	const initialOptions = initialValues.map(
		(optionValue) => options.find(getOptionComparator(optionValue))!,
	);
	const [selectedOptions, setSelectedOptions] =
		useState<OptionType<OptionValueType>[]>(initialOptions);

	const onOptionSelect = useCallback(
		(newOptionValue: string) => {
			const findNewOption = getOptionComparator(newOptionValue);

			const optionAlreadySelected = selectedOptions.find(findNewOption);
			if (optionAlreadySelected) {
				const newOptions = selectedOptions.filter(
					(option) =>
						option.value.toLowerCase() !== newOptionValue.toLowerCase(),
				);
				setSelectedOptions(newOptions);
				onChange(newOptions);
				return;
			}

			const newOption = options.find(findNewOption)!;
			if (!newOption) return selectedOptions;

			const newOptions = [...selectedOptions, newOption];
			setSelectedOptions(newOptions);
			onChange(newOptions);
		},
		[selectedOptions, options, onChange],
	);

	return (
		<div className="flex items-center border border-grayMed rounded-full">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						role="combobox"
						aria-expanded={open}
						className={cn(
							"w-fit justify-between rounded-none h-[38px]",
							"hover:bg-alt hover:text-fg border-grayLight",
							"text-base bg-bg dark:bg-grayUltraLight",
							"p-0 pr-2 rounded-full",
							className,
						)}
					>
						<div className="flex gap-1 py-1 px-2 items-center border-r border-grayLight">
							{!selectedOptions.length && (
								<span className="text-grayDark opacity-80 inline-flex py-1 px-2 h-7 min-w-40">
									{placeholder}
								</span>
							)}
							{selectedOptions.length > 0 && (
								<div className="min-w-40 flex gap-4 justify-between items-center">
									<div className="flex gap-1">
										{[...selectedOptions].slice(0, 5).map((option) => (
											<button
												type="button"
												key={option.value}
												className="focusable rounded-full"
												onClick={(evt) => {
													evt.stopPropagation();
													onOptionSelect(option.value);
												}}
											>
												{selectedValueFormater(option.value)}
											</button>
										))}
										{selectedOptions.length > 5 && (
											<span className="rounded-full bg-bg">
												<IconBadge
													icon={null}
													label={`+${selectedOptions.length - 5}`}
												/>
											</span>
										)}
									</div>

									<X
										onClick={(evt) => {
											setSelectedOptions([]);
											onChange([]);
											setOpen(false);
										}}
										onKeyDown={(evt) => {
											if (evt.key === "Enter" || evt.key === " ") {
												setOpen(false);
												onChange([]);
												setSelectedOptions([]);
											}
										}}
										className="bg-grayDark text-bg rounded-full focusable"
										size={16}
										tabIndex={0}
										role="button"
										aria-label="Clear selected options"
									/>
								</div>
							)}
						</div>
						<ChevronDown className="inline-block" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-fit p-0" align="end">
					<Command>
						<CommandInput placeholder="Search..." />
						<CommandEmpty>Nothing found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={onOptionSelect}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											selectedOptions.find(getOptionComparator(option.value))
												? "opacity-100"
												: "opacity-0",
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
		</div>
	);
}

function getOptionComparator<OptionValueType extends string = string>(
	optionToCompareTo: OptionValueType,
	include = true,
) {
	const a = optionToCompareTo.toLowerCase();
	return (option: OptionType<OptionValueType>) => {
		const b = option.value.toLowerCase();
		return include ? a === b : a !== b;
	};
}

function getDefaultValueFormatter<OptionValueType extends string = string>(
	options: OptionType<OptionValueType>[],
) {
	return function defaultFormatter(value: OptionValueType) {
		const label = options.find((option) => option.value === value)?.label;
		return <IconBadge icon={<X />} label={label} />;
	};
}
