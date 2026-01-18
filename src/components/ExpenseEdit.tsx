"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { PillText } from "@/components/PillText";
import CurrencyInput from "@/components/ui/currency-input";
import {
	type ExpenseType,
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
} from "@/db/schema";
import env from "@/env";
import useExpense from "@/utility/data/useExpense";
import useExpenseCreate from "@/utility/data/useExpenseCreate";
import useExpenseEdit from "@/utility/data/useExpenseEdit";
import {
	categoryToOptionClass,
	mapTypeToIcon,
} from "@/utility/expensesIconUtil";
import { getNowInUTC } from "@/utility/timeUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";

export default function ExpenseEdit({
	id,
	formId,
}: {
	id?: number;
	formId: string;
}) {
	const editMutation = useExpenseEdit();
	const createMutation = useExpenseCreate();
	const { data: expense } = useExpense(id);
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
			category,
			type,
			originalPrice,
			originalCurrency,
			rate,
		},
	});

	const categoryOptions = useComboboxOptions({
		optionValues: expenseCategoryEnum.enumValues,
		renderer: (cat) => (
			<PillText pillColorClass={categoryToOptionClass(cat)}>{cat}</PillText>
		),
		accessorFn: (cat) => cat,
	});

	const typeOptions = useComboboxOptions<ExpenseType["type"]>({
		optionValues: expenseTypeEnum.enumValues,
		renderer: (type) => (
			<>
				{mapTypeToIcon(type, 24)}
				<span>{type}</span>
			</>
		),
	});

	const rateOptions = useComboboxOptions<ExpenseType["rate"]>({
		optionValues: expenseRateEnum.enumValues,
	});

	return (
		<form
			onSubmit={handleSubmit((values) => {
				router.push(`${env.client.NEXT_PUBLIC_BASE_URL}/expenses`);
				const expense = {
					...values,
					type,
					category,
					rate,
					originalPrice,
					originalCurrency,
				};
				if (id) {
					editMutation.mutate({
						...expense,
						id,
						last_modified: getNowInUTC(),
					});
				} else createMutation.mutate([expense]);
			})}
			id={formId}
			className="@container"
		>
			<div className="flex flex-col gap-6">
				<FormInputWrapper label="Name" error={errors?.name?.message as string}>
					<input
						className="form-input dark:bg-card"
						placeholder="Expense name"
						type="text"
						{...register("name", { required: true })}
						defaultValue={expense?.name}
					/>
				</FormInputWrapper>
				<div className="grid @md:grid-cols-2 gap-6">
					<FormInputCombobox
						options={categoryOptions}
						inputProps={register("category")}
						label="Category"
						value={category}
						onChange={(val) => setCategory(val as ExpenseType["category"])}
						error={errors?.category?.message as string}
						className="w-full"
					/>
					<FormInputCombobox
						options={typeOptions}
						inputProps={register("type")}
						label="Type"
						value={type}
						onChange={(val) => setType(val as ExpenseType["type"])}
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
					<FormInputCombobox
						options={rateOptions}
						inputProps={register("rate")}
						label="Billing Rate"
						value={rate}
						onChange={(val) => setRate(val as ExpenseType["rate"])}
						className="w-full"
						error={errors?.rate?.message as string}
					/>
				</div>
			</div>
		</form>
	);
}
