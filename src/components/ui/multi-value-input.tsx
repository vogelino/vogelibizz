"use client";

import { ArrowLeftToLine, Check, ChevronDown, X } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
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
	selectedValueFormater?: (value: string | number) => ReactNode;
	loading?: boolean;
};

export function MultiValueInput<OptionValueType extends string = string>({
	options,
	onChange: originalOnChange,
	values: initialValues = [],
	className,
	placeholder = "Select options",
	selectedValueFormater,
	loading = false,
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

	useEffect(() => {
		const nextOptions = initialValues
			.map((optionValue) => options.find(getOptionComparator(optionValue))!)
			.filter(Boolean);
		setSelectedOptions((currentOptions) =>
			areOptionsEqual(currentOptions, nextOptions)
				? currentOptions
				: nextOptions,
		);
	}, [initialValues, options]);

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

	if (loading) {
		return (
			<div className="flex items-center border border-border">
				<div
					className={cn(
						buttonVariants({ variant: "ghost" }),
						"w-full h-9",
						"bg-background dark:bg-card",
						"p-0",
						className,
					)}
				>
					<Skeleton className="h-9 w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center border border-border">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<div
						role="combobox"
						aria-expanded={open}
						tabIndex={0}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								setOpen((current) => !current);
							}
						}}
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"w-fit justify-between h-auto min-h-9.5",
							"hover:bg-accent hover:text-accent-foreground border-border",
							"text-base bg-background dark:bg-card",
							"p-0 pr-2 py-1.5",
							className,
						)}
					>
						<div className="flex gap-4 pl-1.5 pr-3 items-center border-r border-border w-full">
							{!selectedOptions.length && (
								<span className="text-muted-foreground pl-1.5 opacity-80 min-w-40 [text-box-trim:trim-both]">
									{placeholder}
								</span>
							)}
							{selectedOptions.length > 0 && (
								<div className="min-w-40 flex gap-4 justify-between items-center w-full">
									<div className="flex gap-x-1.5 gap-y-1">
										{[...selectedOptions].slice(0, 5).map((option) => (
											<button
												key={option.value}
												type="button"
												className="focusable text-sm trim-both items-center h-fit"
												onClick={(evt) => {
													evt.stopPropagation();
													onOptionSelect(option.value);
												}}
											>
												{selectedValueFormaterFn(option.value)}
											</button>
										))}

										{selectedOptions.length > 5 && (
											<span className="bg-background">
												<IconBadge
													icon={null}
													label={`+${selectedOptions.length - 5}`}
												/>
											</span>
										)}
									</div>

									<button
										type="button"
										onPointerDown={(evt) => {
											evt.preventDefault();
											evt.stopPropagation();
										}}
										onClick={(evt) => {
											evt.stopPropagation();
											setSelectedOptions([]);
											onChange([]);
											setOpen(false);
										}}
										className="text-muted-foreground hover:text-foreground focusable"
										aria-label="Clear selected options"
									>
										<ArrowLeftToLine size={20} />
									</button>
								</div>
							)}
						</div>
						<ChevronDown className="inline-block" />
					</div>
				</PopoverTrigger>
				<PopoverContent className="w-fit p-0" align="end">
					<Command>
						<CommandInput placeholder="Search..." />
						<CommandList>
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
						</CommandList>
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

function areOptionsEqual(a: OptionType[], b: OptionType[]) {
	if (a.length !== b.length) return false;
	return a.every((option, index) => {
		const otherOption = b[index];
		if (!otherOption) return false;
		return (
			String(option.value).toLowerCase() ===
			String(otherOption.value).toLowerCase()
		);
	});
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
						className="text-muted-foreground hover:text-foreground shrink-0"
						aria-hidden="true"
					/>
				}
				label={option?.label}
				className="flex-row-reverse pl-2.5 pr-1.5"
			/>
		);
	};
}
