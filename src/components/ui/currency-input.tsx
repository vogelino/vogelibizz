import FormInputWrapper from '@components/FormInputWrapper'
import { ExpenseType, currency as currencyEnum } from '@db/schema'
import { cn } from '@utility/classNames'
import { locale } from '@utility/formatUtil'
import { Banknote } from 'lucide-react'
import { HTMLProps, PropsWithChildren, useMemo } from 'react'
import ReactCurrencyInput, {
	type CurrencyInputProps,
} from 'react-currency-input-field'
import { Combobox } from './combobox'

const currencyDisplay = new Intl.DisplayNames(['en-GB'], { type: 'currency' })

function CurrencyInput({
	className,
	inputProps,
	currencyProps,
	currency,
	value,
	onCurrencyChange,
	onValueChange,
	label = 'Amount',
}: PropsWithChildren<{
	inputProps: CurrencyInputProps
	currencyProps: HTMLProps<HTMLInputElement>
	onCurrencyChange: (currency: ExpenseType['original_currency']) => void
	onValueChange: (value: number) => void
	currency: ExpenseType['original_currency']
	value: number | undefined
	label?: string
	className?: string
}>) {
	const options = useMemo(
		() =>
			currencyEnum.enumValues.map((c) => ({
				label: (
					<span className="flex gap-2 justify-between w-full">
						<span>{currencyDisplay.of(c)}</span>
						<span className="text-grayDark opacity-80 flex gap-2">
							<span>{getCurrencySymbol(c)}</span>
							<span>·</span>
							<span>{c}</span>
						</span>
					</span>
				),
				value: c,
			})),
		[],
	)

	return (
		<FormInputWrapper label={label}>
			<div className="flex">
				<div className="relative w-full">
					<div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none text-grayDark opacity-80">
						<Banknote />
					</div>
					<input type="hidden" {...inputProps} />
					<ReactCurrencyInput
						className={cn(
							'form-input dark:bg-grayUltraLight',
							'ps-12 w-full font-mono border-r-0',
							inputProps?.className,
							className,
						)}
						placeholder="0.00"
						required
						defaultValue={value}
						onValueChange={(_value, _name, values) =>
							values?.float && onValueChange(values?.float)
						}
						intlConfig={{ locale }}
						decimalScale={2}
					/>
				</div>
				<input type="hidden" {...currencyProps} value={currency} />
				<Combobox<ExpenseType['original_currency']>
					className={cn('h-auto py-1 border-grayMed', className)}
					options={options}
					value={currency}
					onChange={(currency) => onCurrencyChange(currency)}
					selectedValueFormater={() => (
						<span className="translate-y-[3px]">{currency}</span>
					)}
				/>
			</div>
		</FormInputWrapper>
	)
}

function getCurrencySymbol(currency: ExpenseType['original_currency']) {
	return (0)
		.toLocaleString('en-GB', {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		})
		.replace(/\d/g, '')
		.trim()
}

export default CurrencyInput
