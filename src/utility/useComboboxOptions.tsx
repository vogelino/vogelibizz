import { useRef, type ReactNode } from "react";

export type OptionType = {
	label: ReactNode;
	value: string | number;
};

type UseComboboxOptionsParams<OptionValueType> = {
		optionValues: OptionValueType[];
		renderer?: (value: OptionValueType) => ReactNode;
		accessorFn?: (value: OptionValueType) => string | number;
	}

function useComboboxOptions<OptionValueType = string | number>({
	optionValues = [],
	renderer = (value) => <span className="pt-1">{String(value)}</span>,
	accessorFn = (value) => String(value),
}: UseComboboxOptionsParams<OptionValueType>) {
	return useRef(
		optionValues.map((value) => ({
			label: renderer(value),
			value: accessorFn(value)
		})),
	).current;
}

export default useComboboxOptions;
