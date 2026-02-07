"use client";

import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormInputCombobox from "@/components/FormInputCombobox";
import FormInputWrapper from "@/components/FormInputWrapper";
import { PillText } from "@/components/PillText";
import CurrencyInput from "@/components/ui/currency-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type ExpenseType,
	type ExpenseWithMonthlyCLPPriceType,
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
} from "@/db/schema";
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
	initialData,
	loading = false,
}: {
	id?: number;
	formId: string;
	initialData?: ExpenseWithMonthlyCLPPriceType;
	loading?: boolean;
}) {
	const editMutation = useExpenseEdit();
	const createMutation = useExpenseCreate();
	const { data: expense } = useExpense(id, initialData);
	const navigate = useNavigate();
	const isLoading = loading || (Boolean(id) && !expense);
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
		reset,
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

	useEffect(() => {
		if (!expense) return;
		setType(expense.type ?? "Freelance");
		setCategory(expense.category ?? "Administrative");
		setRate(expense.rate ?? "Monthly");
		setOriginalPrice(expense.originalPrice ?? 0);
		setOriginalCurrency(expense.originalCurrency ?? "USD");
		reset({
			name: expense.name ?? "",
			category: expense.category ?? "Administrative",
			type: expense.type ?? "Freelance",
			originalPrice: expense.originalPrice ?? 0,
			originalCurrency: expense.originalCurrency ?? "USD",
			rate: expense.rate ?? "Monthly",
		});
	}, [expense, reset]);

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
				navigate({ to: "/expenses" });
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
				<FormInputWrapper
					label="Name"
					error={errors?.name?.message as string}
					loading={isLoading}
					loadingChildren={<Skeleton className="h-9 w-full" />}
				>
					{!isLoading && (
						<input
							className="form-input dark:bg-card"
							placeholder="Expense name"
							type="text"
							{...register("name", { required: true })}
							defaultValue={expense?.name}
						/>
					)}
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
						loading={isLoading}
					/>
					<FormInputCombobox
						options={typeOptions}
						inputProps={register("type")}
						label="Type"
						value={type}
						onChange={(val) => setType(val as ExpenseType["type"])}
						className="w-full"
						error={errors?.type?.message as string}
						loading={isLoading}
					/>
					<CurrencyInput
						label="Original price"
						inputProps={register("originalPrice")}
						currencyProps={register("originalCurrency")}
						onCurrencyChange={setOriginalCurrency}
						onValueChange={setOriginalPrice}
						currency={originalCurrency}
						value={originalPrice}
						loading={isLoading}
					/>
					<FormInputCombobox
						options={rateOptions}
						inputProps={register("rate")}
						label="Billing Rate"
						value={rate}
						onChange={(val) => setRate(val as ExpenseType["rate"])}
						className="w-full"
						error={errors?.rate?.message as string}
						loading={isLoading}
					/>
				</div>
			</div>
		</form>
	);
}
