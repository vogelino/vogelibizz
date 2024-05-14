"use client";

import { ArrowLeftToLine, Check, ChevronDown, X } from "lucide-react";

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

type OptionType = {
	label: ReactNode;
	value: string | number;
};

type MultiValueInputProps<OptionValueType> = {
	options: OptionType[];
	onChange?: (newOptions: OptionType[]) => void;
	values?: OptionValueType[];
	className?: string;
	placeholder?: string;
	selectedValueFormater?: (value: string | number) => JSX.Element;
};

export function MultiValueInput<OptionValueType extends string = string>({
	options,
	onChange: originalOnChange,
	values: initialValues = [],
	className,
	placeholder = "Select options",
	selectedValueFormater,
}: MultiValueInputProps<OptionValueType>) {
	const onChange = originalOnChange || (() => {});
	const selectedValueFormaterFn =
		selectedValueFormater || getDefaultValueFormatter(options);
	const [open, setOpen] = useState(false);
	const initialOptions = initialValues.map(
		(optionValue) => options.find(getOptionComparator(optionValue))!,
	);
	const [selectedOptions, setSelectedOptions] =
		useState<OptionType[]>(initialOptions);

	const onOptionSelect = useCallback(
		(newOptionValue: string | number) => {
			const findNewOption = getOptionComparator(newOptionValue);

			const optionAlreadySelected = selectedOptions.find(findNewOption);
			if (optionAlreadySelected) {
				const newOptions = selectedOptions.filter(
					(option) =>
						String(option.value).toLowerCase() !==
						String(newOptionValue).toLowerCase(),
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
						<div className="flex gap-1 px-1.5 items-center border-r border-grayLight w-full">
							{!selectedOptions.length && (
								<span className="text-grayDark opacity-80 inline-flex py-1 px-2 h-7 min-w-40">
									{placeholder}
								</span>
							)}
							{selectedOptions.length > 0 && (
								<div className="min-w-40 flex gap-4 justify-between items-center w-full">
									<div className="flex gap-1">
										{[...selectedOptions].slice(0, 5).map((option) => (
											<span
												role="button"
												key={option.value}
												className="focusable rounded-full"
												onKeyDown={(evt) => {
													if (evt.key === "Enter" || evt.key === " ") {
														evt.stopPropagation();
														onOptionSelect(option.value);
													}
												}}
												onClick={(evt) => {
													evt.stopPropagation();
													onOptionSelect(option.value);
												}}
											>
												{selectedValueFormaterFn(option.value)}
											</span>
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

									<ArrowLeftToLine
										onClick={() => {
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
										className="text-grayDark hover:text-fg rounded-full focusable"
										size={20}
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
									value={String(option.value)}
									onSelect={(newValue) =>
										onOptionSelect(newValue as OptionValueType)
									}
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

function getOptionComparator(
	optionToCompareTo: number | string,
	include = true,
) {
	const a = String(optionToCompareTo).toLowerCase();
	return (option: OptionType) => {
		const b = String(option.value).toLowerCase();
		return include ? a === b : a !== b;
	};
}

function getDefaultValueFormatter(options: OptionType[]) {
	return function defaultFormatter(value: string | number) {
		const option = options.find(
			(option) => String(option.value) === String(value),
		);
		return (
			<IconBadge
				icon={
					<X
						size={18}
						className="text-grayDark hover:text-fg rounded-full shrink-0"
						role="button"
						aria-label={`Remove label ${option?.value}`}
					/>
				}
				label={option?.label}
				className="flex-row-reverse pl-2.5 pr-1.5"
			/>
		);
	};
}
