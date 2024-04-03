import { ExpenseType } from '@db/schema'
import { Handshake, User } from 'lucide-react'
import { ReactNode } from 'react'

type TailwindColorType = string

export const categoryToColorClass = (
	category: ExpenseType['category'],
): TailwindColorType => {
	switch (category) {
		case 'Charity':
			return 'bg-red-50 text-red-900 border-red-100'
		case 'Transport':
			return 'bg-blue-50 text-blue-900 border-blue-100'
		case 'Domain':
			return 'bg-green-50 text-green-900 border-green-100'
		case 'Entertainment':
			return 'bg-yellow-50 text-yellow-900 border-yellow-100'
		case 'Essentials':
			return 'bg-purple-50 text-purple-900 border-purple-100'
		case 'Hardware':
			return 'bg-pink-50 text-pink-900 border-pink-100'
		case 'Health & Wellbeing':
			return 'bg-orange-50 text-orange-900 border-orange-100'
		case 'Hobby':
			return 'bg-indigo-50 text-indigo-900 border-indigo-100'
		case 'Home':
			return 'bg-gray-50 text-gray-900 border-gray-100'
		case 'Present':
			return 'bg-teal-50 text-teal-900 border-teal-100'
		case 'Savings':
			return 'bg-lime-50 text-lime-900 border-lime-100'
		case 'Services':
			return 'bg-amber-50 text-amber-900 border-amber-100'
		case 'Software':
			return 'bg-violet-50 text-violet-900 border-violet-100'
		case 'Travel':
			return 'bg-emerald-50 text-emerald-900 border-emerald-100'
		default:
			return 'inherit'
	}
}

export const typeToColorClass = (
	type: ExpenseType['type'],
): TailwindColorType => {
	switch (type) {
		case 'Freelance':
			return 'bg-red-50 text-red-900 border-red-100'
		case 'Personal':
			return 'bg-blue-50 text-blue-900 border-blue-100'
		default:
			return 'inherit'
	}
}

const typeToIconMap: Record<ExpenseType['type'], ReactNode> = {
	Freelance: <Handshake size={16} />,
	Personal: <User size={16} />,
}

export const mapTypeToIcon = (type: ExpenseType['type']): ReactNode => {
	return typeToIconMap[type] || null
}

type OpenExchangeRatesReturnType<Base = 'CLP'> = {
	disclaimer: string
	license: string
	timestamp: number
	base: Base
	rates: Record<CurrencyType, number>
}
type CurrencyType = ExpenseType['original_currency']
export type RatesTypes = Record<CurrencyType, number>
export async function getExchangeRates(
	base: CurrencyType = 'CLP',
): Promise<RatesTypes> {
	const API_ID = process.env.NEXT_PUBLIC_OPENEXCHANGERATES_API_KEY

	if (!API_ID) throw new Error('Missing OpenExchangeRates API key')
	const res = await fetch(
		`https://openexchangerates.org/api/latest.json?app_id=${API_ID}`,
	)
	const json = (await res.json()) as OpenExchangeRatesReturnType<typeof base>

	if (base !== 'USD') {
		json.rates = Object.entries(json.rates).reduce(
			(obj, [k, v]) => ({ ...obj, [k]: v / json.rates[base] }),
			{} as RatesTypes,
		)
	}

	return json.rates
}

export function getValueInCLPPerMonth({
	value,
	currency,
	rates,
	billingRate,
}: {
	value: number
	currency: ExpenseType['original_currency']
	rates: null | Record<ExpenseType['original_currency'], number>
	billingRate: ExpenseType['rate']
}) {
	if (!rates) return null
	let monthlyPrice = value
	if (currency !== 'CLP') {
		monthlyPrice = value / rates[currency] ?? 0
	}
	if (billingRate !== 'Monthly') {
		switch (billingRate) {
			case 'Yearly':
				monthlyPrice /= 12
				break
			case 'Weekly':
				monthlyPrice *= 4
				break
			case 'Daily':
				monthlyPrice = (monthlyPrice * 165) / 12
				break
			case 'Bi-Monthly':
				monthlyPrice /= 2
				break
			case 'Bi-Weekly':
				monthlyPrice *= 2
				break
			case 'Bi-Yearly':
				monthlyPrice /= 24
				break
			case 'Hourly':
				monthlyPrice = (monthlyPrice * 24 * 365) / 12
				break
			case 'Quarterly':
				monthlyPrice /= 4
				break
			case 'Semester':
				monthlyPrice /= 6
				break
			case 'One-time':
				monthlyPrice /= 12
				break
		}
	}
	return monthlyPrice
}
