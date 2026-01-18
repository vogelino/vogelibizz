import type { HTMLProps, ReactNode } from "react";
import FormInputWrapper from "@/components/FormInputWrapper";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/utility/classNames";
import type { OptionType } from "@/utility/useComboboxOptions";

function FormInputCombobox({
	options,
	value,
	onChange,
	error,
	label,
	inputProps,
	className,
}: {
	error?: string;
	inputProps: HTMLProps<HTMLInputElement>;
	options: OptionType[];
	onChange: (value: string | number) => void;
	label: ReactNode;
	value: string;
	className?: string;
}) {
	return (
		<FormInputWrapper label={label} error={error}>
			<input type="hidden" {...inputProps} />
			<Combobox
				className={cn("h-auto py-1 border-border", className)}
				options={options}
				value={value}
				onChange={(val) => onChange(val)}
			/>
		</FormInputWrapper>
	);
}

export default FormInputCombobox;
