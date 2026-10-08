"use client";

import {
	type FocusEvent,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "@/utility/classNames";
import { Combobox, type ComboboxProps } from "./combobox";
import { DatePickerInput } from "./date-picker-input";
import {
	MultiValueInput,
	type MultiValueInputProps,
} from "./multi-value-input";

type InlineEditValue = string | number;

export function InlineInput<Value extends InlineEditValue>({
	value,
	displayValue,
	onCommit,
	type = "text",
	ariaLabel,
	className,
	displayClassName,
	inputClassName,
	min,
	step,
}: {
	value: Value;
	displayValue?: ReactNode;
	onCommit: (value: Value) => void;
	type?: "text" | "number" | "date";
	ariaLabel: string;
	className?: string;
	displayClassName?: string;
	inputClassName?: string;
	min?: number;
	step?: number | "any";
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(String(value));
	const inputRef = useRef<HTMLInputElement>(null);
	const cancelBlurRef = useRef(false);

	useEffect(() => {
		if (!editing) setDraft(String(value));
	}, [editing, value]);

	useEffect(() => {
		if (!editing) return;
		inputRef.current?.focus();
		inputRef.current?.select();
	}, [editing]);

	const finishEditing = (event?: FocusEvent<HTMLInputElement>) => {
		if (cancelBlurRef.current) {
			cancelBlurRef.current = false;
			setDraft(String(value));
			setEditing(false);
			return;
		}

		const nextValue =
			type === "number" ? Number(draft) : (draft.trim() as InlineEditValue);
		const invalid =
			(type === "number" &&
				(!Number.isFinite(nextValue) ||
					draft.trim() === "" ||
					(min !== undefined &&
						typeof nextValue === "number" &&
						nextValue < min) ||
					(step === 1 &&
						typeof nextValue === "number" &&
						!Number.isInteger(nextValue)))) ||
			(type !== "number" && nextValue === "");

		if (invalid) {
			setDraft(String(value));
			setEditing(false);
			return;
		}

		if (nextValue !== value) onCommit(nextValue as Value);
		setEditing(false);
		event?.currentTarget.blur();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			event.currentTarget.blur();
		}
		if (event.key === "Escape") {
			event.preventDefault();
			cancelBlurRef.current = true;
			event.currentTarget.blur();
		}
	};

	return (
		<div className={cn("relative h-9 min-w-0 w-full", className)}>
			{editing ? (
				<input
					ref={inputRef}
					type={type}
					value={draft}
					min={min}
					step={type === "number" ? (step ?? "any") : undefined}
					aria-label={ariaLabel}
					className={cn(
						"absolute inset-y-0 -left-2 h-9 w-[calc(100%+0.5rem)]",
						"border border-border bg-background px-2 text-base text-foreground outline-none",
						"focus:border-ring focus:ring-2 focus:ring-ring/30",
						"dark:bg-card",
						inputClassName,
					)}
					onChange={(event) => setDraft(event.target.value)}
					onBlur={finishEditing}
					onKeyDown={handleKeyDown}
				/>
			) : (
				<button
					type="button"
					aria-label={`Edit ${ariaLabel}`}
					className={cn(
						"absolute inset-y-0 -left-2 flex h-9 w-[calc(100%+0.5rem)] min-w-0 items-center px-2 text-left",
						"cursor-text border border-transparent bg-transparent outline-none",
						"hover:border-border focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
						displayClassName,
					)}
					onClick={() => setEditing(true)}
				>
					<span className="block min-w-0 truncate">
						{displayValue ?? value}
					</span>
				</button>
			)}
		</div>
	);
}

export function InlineDatePickerInput({
	value,
	displayValue,
	onCommit,
	ariaLabel,
	className,
	displayClassName,
}: {
	value: string;
	displayValue: ReactNode;
	onCommit: (value: string) => void;
	ariaLabel: string;
	className?: string;
	displayClassName?: string;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value);
	const [calendarOpen, setCalendarOpen] = useState(false);
	const draftRef = useRef(value);
	const calendarSelectionRef = useRef(false);

	useEffect(() => {
		if (editing) return;
		setDraft(value);
		draftRef.current = value;
	}, [editing, value]);

	const finishEditing = (nextValue = draftRef.current) => {
		const trimmedValue = nextValue.trim();
		if (trimmedValue && trimmedValue !== value) onCommit(trimmedValue);
		setEditing(false);
	};

	return (
		<fieldset
			className={cn("relative m-0 h-9 min-w-0 w-full border-0 p-0", className)}
			onBlur={(event) => {
				if (
					editing &&
					!calendarOpen &&
					!event.currentTarget.contains(event.relatedTarget)
				) {
					finishEditing();
				}
			}}
		>
			{editing ? (
				<DatePickerInput
					autoFocus
					value={draft}
					dateFormat="dd.MM.yyyy"
					placeholder="DD.MM.YYYY"
					defaultCalendarOpen
					showCalendarButton={false}
					keepInputFocusOnOpen
					aria-label={ariaLabel}
					calendarLabel={`Select ${ariaLabel}`}
					commitEmpty={false}
					containerClassName="absolute inset-y-0 -left-2 z-10 h-9 w-[calc(100%+0.5rem)] min-w-32"
					className="px-2 pr-2 text-sm tabular-nums"
					onChange={(nextValue) => {
						draftRef.current = nextValue;
						setDraft(nextValue);
					}}
					onDateSelect={(nextValue) => {
						calendarSelectionRef.current = true;
						finishEditing(nextValue);
					}}
					onCalendarOpenChange={(open) => {
						setCalendarOpen(open);
						if (open) return;
						queueMicrotask(() => {
							if (calendarSelectionRef.current) {
								calendarSelectionRef.current = false;
								return;
							}
							finishEditing();
						});
					}}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							finishEditing();
						}
						if (event.key === "Escape" && !calendarOpen) {
							event.preventDefault();
							draftRef.current = value;
							setDraft(value);
							setEditing(false);
						}
					}}
				/>
			) : (
				<button
					type="button"
					aria-label={`Edit ${ariaLabel}`}
					className={cn(
						"absolute inset-y-0 -left-2 flex h-9 w-[calc(100%+0.5rem)] min-w-0 items-center px-2 text-left",
						"cursor-text border border-transparent bg-transparent outline-none",
						"hover:border-border focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
						displayClassName,
					)}
					onClick={() => {
						setCalendarOpen(true);
						setEditing(true);
					}}
				>
					<span className="block min-w-0 truncate">{displayValue}</span>
				</button>
			)}
		</fieldset>
	);
}

const inlineComboboxClassName = cn(
	"h-9 -ml-2 w-[calc(100%+0.5rem)] justify-start border-transparent bg-transparent px-2 dark:bg-transparent",
	"hover:border-border hover:bg-transparent hover:text-foreground",
	"focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
	"[&>svg]:opacity-0 hover:[&>svg]:opacity-50 focus-visible:[&>svg]:opacity-50",
);

export function InlineCombobox<Value>({
	className,
	...props
}: ComboboxProps<Value>) {
	return (
		<Combobox {...props} className={cn(inlineComboboxClassName, className)} />
	);
}

export function InlineMultiCombobox<Value extends string = string>(
	props: Omit<MultiValueInputProps<Value>, "variant">,
) {
	return <MultiValueInput {...props} variant="inline" />;
}
