export const locale = 'en-GB'

export function formatCurrency(value: number, currency = 'CLP') {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value)
}
