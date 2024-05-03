"use client";

import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { PillText } from "@/components/PillText";
import CurrencyInput from "@/components/ui/currency-input";
import {
	expenseCategory,
	expenseRate,
	expenseType,
	type ExpenseType,
} from "@/db/schema";
import { categoryToOptionClass, mapTypeToIcon } from "@/utility/expensesUtil";
import type { FormErrorsType } from "@/utility/formUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";
import { useForm } from "@refinedev/react-hook-form";
import { useRef, useState } from "react";

export default function ExpenseEdit({
	id,
	formId,
	initialData,
}: {
	formId: string;
	id?: undefined | string;
	initialData?: ExpenseType;
}) {
	const [category, setCategory] = useState<ExpenseType["category"]>(
		initialData?.category || "Home",
	);
	const [type, setType] = useState<ExpenseType["type"]>(
		initialData?.type || "Personal",
	);
	const [name, setName] = useState<ExpenseType["name"]>(
		initialData?.name || "",
	);
	const [price, setPrice] = useState<ExpenseType["price"]>(
		initialData?.price || 0,
	);
	const [currency, setCurrency] = useState<ExpenseType["original_currency"]>(
		initialData?.original_currency || "USD",
	);
	const [rate, setRate] = useState<ExpenseType["rate"]>(
		initialData?.rate || "Monthly",
	);
	const last_modified = useRef(new Date().toISOString());
	const values = {
		name,
		last_modified: last_modified.current,
		category,
		type,
		price: price ?? 0,
		original_currency: currency,
		rate,
	};
	const {
		refineCore: { onFinish },
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		refineCoreProps: { resource: "expenses", id, meta: { select: "*" } },
		values,
	});

	const categoryOptions = useComboboxOptions<ExpenseType["category"]>(
		expenseCategory.enumValues,
		(cat) => (
			<PillText pillColorClass={categoryToOptionClass(cat)}>{cat}</PillText>
		),
	);

	const typeOptions = useComboboxOptions<ExpenseType["type"]>(
		expenseType.enumValues,
		(type) => (
			<>
				{mapTypeToIcon(type, 24)}
				<span className="pt-1">{type}</span>
			</>
		),
	);

	const rateOptions = useComboboxOptions<ExpenseType["rate"]>(
		expenseRate.enumValues,
	);
	const allErrors = errors as FormErrorsType<typeof values>;

	return (
		<form onSubmit={handleSubmit(onFinish)} id={formId} className="@container">
			<div className="flex flex-col gap-6">
				<FormInputWrapper
					label="Name"
					error={allErrors?.name?.message as string}
				>
					<input
						className="form-input dark:bg-grayUltraLight"
						placeholder="Expense name"
						type="text"
						{...register("name", { required: true })}
						value={name}
						onChange={(evt) => setName(evt.target.value)}
					/>
				</FormInputWrapper>
				<div className="grid @md:grid-cols-2 gap-6">
					<FormInputCombobox<ExpenseType["category"]>
						options={categoryOptions}
						inputProps={register("category")}
						label="Category"
						value={category}
						onChange={setCategory}
						error={allErrors?.category?.message as string}
						className="w-full"
					/>
					<FormInputCombobox<ExpenseType["type"]>
						options={typeOptions}
						inputProps={register("type")}
						label="Type"
						value={type}
						onChange={setType}
						className="w-full"
						error={allErrors?.type?.message as string}
					/>
					<CurrencyInput
						label="Original price"
						inputProps={register("price")}
						currencyProps={register("original_currency")}
						onCurrencyChange={setCurrency}
						onValueChange={setPrice}
						currency={currency}
						value={price}
					/>
					<FormInputCombobox<ExpenseType["rate"]>
						options={rateOptions}
						inputProps={register("rate")}
						label="Billing Rate"
						value={rate}
						onChange={setRate}
						className="w-full"
						error={allErrors?.rate?.message as string}
					/>
				</div>
			</div>
		</form>
	);
}
