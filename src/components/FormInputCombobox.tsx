import type { HTMLProps, ReactNode } from "react";
import FormInputWrapper from "@/components/FormInputWrapper";
import { Combobox } from "@/components/ui/combobox";
import type { OptionType } from "@/utility/useComboboxOptions";

function FormInputCombobox({
	options,
	value,
	onChange,
	error,
	label,
	inputProps,
	className,
	loading = false,
	disabled = false,
}: {
	error?: string;
	inputProps?: HTMLProps<HTMLInputElement>;
	options: OptionType[];
	onChange: (value: string | number) => void;
	label: ReactNode;
	value: string | number;
	className?: string;
	loading?: boolean;
	disabled?: boolean;
}) {
	return (
		<FormInputWrapper label={label} error={error} loading={loading}>
			{!loading && (
				<>
					{inputProps && <input type="hidden" {...inputProps} />}
					<Combobox
						className={className}
						options={options}
						value={value}
						onChange={(val) => onChange(val)}
						disabled={disabled}
					/>
				</>
			)}
		</FormInputWrapper>
	);
}

export default FormInputCombobox;
