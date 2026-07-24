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

export type MultiValueOption = {
	label: ReactNode;
	value: string | number;
};

export type MultiValueInputProps<OptionValueType> = {
	options: MultiValueOption[];
	onChange?: (newOptions: MultiValueOption[]) => void;
	values?: OptionValueType[];
	className?: string;
	placeholder?: string;
	selectedValueFormater?: (value: string | number) => ReactNode;
	loading?: boolean;
	variant?: "default" | "inline";
	"aria-label"?: string;
};

export function MultiValueInput<OptionValueType extends string = string>({
	options,
	onChange: originalOnChange,
	values: initialValues = [],
	className,
	placeholder = "Select options",
	selectedValueFormater,
	loading = false,
	variant = "default",
	"aria-label": ariaLabel,
}: MultiValueInputProps<OptionValueType>) {
	const onChange = originalOnChange || (() => {});
	const selectedValueFormaterFn =
		selectedValueFormater || getDefaultValueFormatter(options);
	const [open, setOpen] = useState(false);
	const initialOptions = initialValues.map(
		(optionValue) => options.find(getOptionComparator(optionValue))!,
	);
	const [selectedOptions, setSelectedOptions] =
		useState<MultiValueOption[]>(initialOptions);
	const inline = variant === "inline";
	const visibleOptionCount = inline ? 2 : 4;

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
			<div
				className={cn(
					buttonVariants({ variant: "ghost" }),
					"w-full h-9",
					"bg-background dark:bg-card",
					"p-0",
					className,
				)}
			>
				<Skeleton className="h-9.5 w-full" />
			</div>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<div
					role="combobox"
					aria-expanded={open}
					aria-label={ariaLabel}
					tabIndex={0}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							setOpen((current) => !current);
						}
					}}
					className={cn(
						buttonVariants({ variant: "outline" }),
						"group/relations w-fit justify-between",
						inline
							? "-ml-2 w-[calc(100%+0.5rem)] border-transparent bg-transparent text-foreground hover:border-border hover:bg-transparent hover:text-foreground dark:bg-transparent"
							: "bg-background text-base hover:bg-accent hover:text-accent-foreground dark:bg-card",
						"p-0 has-[&>svg]:pl-0 pr-1.5 py-1 h-9",
						className,
					)}
				>
					<div
						className={cn(
							"grow flex gap-4 pl-1 pr-3 items-center border-r border-border w-fit",
							inline && "border-r-transparent pl-2",
						)}
					>
						{!selectedOptions.length && (
							<span
								className={cn(
									"text-muted-foreground pl-1.5 opacity-80 min-w-40 [text-box-trim:trim-both]",
									inline && "min-w-0",
								)}
							>
								{placeholder}
							</span>
						)}
						{selectedOptions.length > 0 && (
							<div
								className={cn(
									"min-w-40 grow flex gap-4 justify-between items-center w-fit",
									inline && "min-w-0",
								)}
							>
								<div className="flex min-w-0 gap-x-1 gap-y-0.5 items-center overflow-hidden">
									{[...selectedOptions]
										.slice(0, visibleOptionCount)
										.map((option) => (
											<button
												key={option.value}
												type="button"
												className="focusable text-sm trim-both items-center h-7"
												onClick={(evt) => {
													if (inline) return;
													evt.stopPropagation();
													onOptionSelect(option.value);
												}}
											>
												{selectedValueFormaterFn(option.value)}
											</button>
										))}

									{selectedOptions.length > visibleOptionCount && (
										<span className="bg-background">
											<IconBadge
												icon={null}
												label={`+${selectedOptions.length - visibleOptionCount}`}
												className="h-7 border-transparent bg-accent/0 hover:bg-accent"
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
									className={cn(
										"text-muted-foreground hover:text-foreground focusable h-7",
										inline &&
											"opacity-0 group-hover/relations:opacity-100 group-focus-within/relations:opacity-100",
									)}
									aria-label="Clear selected options"
								>
									<ArrowLeftToLine size={20} />
								</button>
							</div>
						)}
					</div>
					<ChevronDown
						className={cn(
							"inline-block",
							inline &&
								"opacity-0 group-hover/relations:opacity-50 group-focus-within/relations:opacity-50",
						)}
					/>
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
											"size-5",
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
	);
}

function getOptionComparator(
	optionToCompareTo: number | string,
	include = true,
) {
	const a = String(optionToCompareTo).toLowerCase();
	return (option: MultiValueOption) => {
		const b = String(option.value).toLowerCase();
		return include ? a === b : a !== b;
	};
}

function areOptionsEqual(a: MultiValueOption[], b: MultiValueOption[]) {
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

function getDefaultValueFormatter(options: MultiValueOption[]) {
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
				className="flex-row-reverse pl-2.5 pr-1.5 h-7"
			/>
		);
	};
}
