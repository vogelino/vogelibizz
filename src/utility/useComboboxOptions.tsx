import { type ReactNode, useRef } from "react";

export type OptionType = {
	label: ReactNode;
	value: string | number;
};

type AccessorReturn<T> = T extends string
	? T
	: T extends number
		? T
		: string | number;

type UseComboboxOptionsParams<OptionValueType> = {
	optionValues: readonly OptionValueType[];
	renderer?: (value: OptionValueType) => ReactNode;
	accessorFn?: (value: OptionValueType) => AccessorReturn<OptionValueType>;
};

function useComboboxOptions<OptionValueType = string | number>({
	optionValues = [],
	renderer = (value) => <span>{String(value)}</span>,
	accessorFn,
}: UseComboboxOptionsParams<OptionValueType>) {
	const getValue: (value: OptionValueType) => AccessorReturn<OptionValueType> =
		accessorFn ??
		((value) => {
			if (typeof value === "string" || typeof value === "number") {
				return value as AccessorReturn<OptionValueType>;
			}

			throw new Error(
				"useComboboxOptions: accessorFn is required for non-string/number option values.",
			);
		});

	return useRef(
		optionValues.map((value) => ({
			label: renderer(value),
			value: getValue(value),
		})),
	).current;
}

export default useComboboxOptions;
