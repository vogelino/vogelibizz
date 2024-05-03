import FormInputWrapper from "@/components/FormInputWrapper";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/utility/classNames";
import type { HTMLProps, ReactNode } from "react";

function FormInputCombobox<OptionValueType extends string>({
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
	options: {
		label: ReactNode;
		value: OptionValueType;
	}[];
	onChange: (value: OptionValueType) => void;
	label: ReactNode;
	value: string;
	className?: string;
}) {
	return (
		<FormInputWrapper label={label} error={error}>
			<input type="hidden" {...inputProps} />
			<Combobox<OptionValueType>
				className={cn("h-auto py-1 border-grayMed", className)}
				options={options}
				value={value}
				onChange={onChange}
			/>
		</FormInputWrapper>
	);
}

export default FormInputCombobox;
