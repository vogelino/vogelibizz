import { ReactNode, useMemo } from 'react'

export type OptionType<T extends string> = {
	label: ReactNode
	value: T
}

function useComboboxOptions<OptionValueType extends string = string>(
	optionValues: OptionValueType[],
	renderer: (value: OptionValueType) => ReactNode = (value) => (
		<span className="pt-1">{value}</span>
	),
) {
	return useMemo(
		() =>
			optionValues.map((value) => ({
				label: renderer(value),
				value,
			})),
		[optionValues, renderer],
	)
}

export default useComboboxOptions
