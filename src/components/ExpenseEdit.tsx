"use client";

import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { PillText } from "@/components/PillText";
import CurrencyInput from "@/components/ui/currency-input";
import {
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
	type ExpenseType,
} from "@/db/schema";
import env from "@/env";
import useExpense from "@/utility/data/useExpense";
import useExpenseCreate from "@/utility/data/useExpenseCreate";
import useExpenseEdit from "@/utility/data/useExpenseEdit";
import {
	categoryToOptionClass,
	mapTypeToIcon,
} from "@/utility/expensesIconUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ExpenseEdit({
	id,
	formId,
}: {
	formId: string;
	id?: string;
}) {
	const editMutation = useExpenseEdit();
	const createMutation = useExpenseCreate();
	const { data: expense } = useExpense(id ? +id : undefined);
	const router = useRouter();
	const [type, setType] = useState(expense?.type ?? "Freelance");
	const [category, setCategory] = useState(
		expense?.category ?? "Administrative",
	);
	const [rate, setRate] = useState(expense?.rate ?? "Monthly");
	const [originalPrice, setOriginalPrice] = useState(
		expense?.originalPrice ?? 0,
	);
	const [originalCurrency, setOriginalCurrency] = useState(
		expense?.originalCurrency ?? "USD",
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: expense?.name ?? "",
			last_modified: new Date().toISOString(),
			category,
			type,
			originalPrice,
			originalCurrency,
			rate,
		},
	});

	const categoryOptions = useComboboxOptions<ExpenseType["category"]>(
		expenseCategoryEnum.enumValues,
		(cat) => (
			<PillText pillColorClass={categoryToOptionClass(cat)}>{cat}</PillText>
		),
	);

	const typeOptions = useComboboxOptions<ExpenseType["type"]>(
		expenseTypeEnum.enumValues,
		(type) => (
			<>
				{mapTypeToIcon(type, 24)}
				<span className="pt-1">{type}</span>
			</>
		),
	);

	const rateOptions = useComboboxOptions<ExpenseType["rate"]>(
		expenseRateEnum.enumValues,
	);

	return (
		<form
			onSubmit={handleSubmit((values) => {
				if (id) {
					editMutation.mutate({
						id,
						...values,
						type,
						category,
						rate,
						originalPrice,
						originalCurrency,
					});
				} else {
					createMutation.mutate([values]);
				}
				router.push(`${env.client.NEXT_PUBLIC_BASE_URL}/expenses`);
			})}
			id={formId}
			className="@container"
		>
			<div className="flex flex-col gap-6">
				<FormInputWrapper label="Name" error={errors?.name?.message as string}>
					<input
						className="form-input dark:bg-grayUltraLight"
						placeholder="Expense name"
						type="text"
						{...register("name", { required: true })}
					/>
				</FormInputWrapper>
				<div className="grid @md:grid-cols-2 gap-6">
					<FormInputCombobox<ExpenseType["category"]>
						options={categoryOptions}
						inputProps={register("category")}
						label="Category"
						value={category}
						onChange={setCategory}
						error={errors?.category?.message as string}
						className="w-full"
					/>
					<FormInputCombobox<ExpenseType["type"]>
						options={typeOptions}
						inputProps={register("type")}
						label="Type"
						value={type}
						onChange={setType}
						className="w-full"
						error={errors?.type?.message as string}
					/>
					<CurrencyInput
						label="Original price"
						inputProps={register("originalPrice")}
						currencyProps={register("originalCurrency")}
						onCurrencyChange={setOriginalCurrency}
						onValueChange={setOriginalPrice}
						currency={originalCurrency}
						value={originalPrice}
					/>
					<FormInputCombobox<ExpenseType["rate"]>
						options={rateOptions}
						inputProps={register("rate")}
						label="Billing Rate"
						value={rate}
						onChange={setRate}
						className="w-full"
						error={errors?.rate?.message as string}
					/>
				</div>
			</div>
		</form>
	);
}
