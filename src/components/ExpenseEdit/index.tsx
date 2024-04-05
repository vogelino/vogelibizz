'use client'

import FormInputCombobox from '@components/FormInputCombobox'
import FormInputWrapper from '@components/FormInputWrapper'
import { PillText } from '@components/PillText'
import CurrencyInput from '@components/ui/currency-input'
import { ExpenseType, expenseCategory, expenseType } from '@db/schema'
import { useForm } from '@refinedev/react-hook-form'
import { categoryToOptionClass, mapTypeToIcon } from '@utility/expensesUtil'
import { ReactNode, useMemo, useRef, useState } from 'react'

type OptionsType<T extends string> = {
	label: ReactNode
	value: T
}[]
export default function ExpenseEdit({
	id,
	formId,
	initialData,
}: {
	formId: string
	id?: undefined | string
	initialData?: ExpenseType
}) {
	const [category, setCategory] = useState<ExpenseType['category']>(
		initialData?.category || 'Home',
	)
	const [type, setType] = useState<ExpenseType['type']>(
		initialData?.type || 'Personal',
	)
	const [name, setName] = useState<ExpenseType['name']>(initialData?.name || '')
	const [price, setPrice] = useState<ExpenseType['price']>(
		initialData?.price || 0,
	)
	const [currency, setCurrency] = useState<ExpenseType['original_currency']>(
		initialData?.original_currency || 'USD',
	)
	const last_modified = useRef(new Date().toISOString())
	const {
		refineCore: { onFinish },
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		refineCoreProps: {
			resource: 'expenses',
			id,
			meta: {
				select: '*',
			},
		},
		values: {
			name,
			last_modified: last_modified.current,
			category,
			type,
			price: price ?? 0,
			original_currency: currency,
		},
	})
	const categoryProps = register('category', {
		required: 'This field is required',
	})
	const typeProps = register('type', {
		required: 'This field is required',
	})
	const currencyProps = register('original_currency', {
		required: 'This field is required',
	})

	const categoryOptions = useMemo(() => {
		const options: OptionsType<ExpenseType['category']> =
			expenseCategory.enumValues.map((cat) => ({
				label: (
					<PillText pillColorClass={categoryToOptionClass(cat)}>{cat}</PillText>
				),
				value: cat,
			}))
		return options
	}, [])

	const typeOptions = useMemo(() => {
		const options: OptionsType<ExpenseType['type']> =
			expenseType.enumValues.map((type) => ({
				label: (
					<>
						{mapTypeToIcon(type, 24)}
						<span className="pt-1">{type}</span>
					</>
				),
				value: type,
			}))
		return options
	}, [])

	return (
		<form onSubmit={handleSubmit(onFinish)} id={formId} className="@container">
			<div className="flex flex-col gap-4">
				<FormInputWrapper
					label="Name"
					error={(errors as any)?.name?.message as string}
				>
					<input
						className="form-input"
						placeholder="Expense name"
						type="text"
						{...register('name', {
							required: 'This field is required',
						})}
						value={name}
						onChange={(evt) => setName(evt.target.value)}
					/>
				</FormInputWrapper>
				<div className="grid @md:grid-cols-2 gap-x-6 gap-y-4">
					<FormInputCombobox<ExpenseType['category']>
						options={categoryOptions}
						inputProps={categoryProps}
						label="Category"
						value={category}
						onChange={setCategory}
						error={(errors as any)?.category?.message as string}
						className="w-full"
					/>
					<FormInputCombobox<ExpenseType['type']>
						options={typeOptions}
						inputProps={typeProps}
						label="Type"
						value={type}
						onChange={setType}
						className="w-full"
						error={(errors as any)?.type?.message as string}
					/>
				</div>
				<div className="grid @md:grid-cols-2 gap-x-6 gap-y-4">
					<CurrencyInput
						label="Original price"
						inputProps={register('price', {
							required: 'This field is required',
						})}
						currencyProps={currencyProps}
						onCurrencyChange={setCurrency}
						onValueChange={setPrice}
						currency={currency}
						value={price}
					/>
				</div>
			</div>
		</form>
	)
}
