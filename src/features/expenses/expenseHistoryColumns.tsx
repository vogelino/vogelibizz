import { createColumnHelper } from "@tanstack/react-table";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { IconBadge } from "@/components/ui/icon-badge";
import { InlineCombobox, InlineInput } from "@/components/ui/inline-edit";
import {
	type CurrencyIdType,
	type ExpenseWithMonthlyCLPPriceType,
	expenseCategoryEnum,
	expenseTypeEnum,
} from "@/db/schema";
import type {
	ExpenseHistoryTransaction,
	ExpenseHistoryTransactionMutation,
} from "@/utility/expenseHistoryContracts";
import { mapTypeToIcon, typeToColorClass } from "@/utility/expensesIconUtil";
import { formatCurrency, locale } from "@/utility/formatUtil";

const columnHelper = createColumnHelper<ExpenseHistoryTransaction>();

function formatDate(date: string) {
	return new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));
}

export function getExpenseHistoryColumns(
	currency: CurrencyIdType,
	onEdit: (
		transaction: ExpenseHistoryTransaction,
		change: Omit<ExpenseHistoryTransactionMutation, "lastModified">,
		optimisticChange?: Partial<ExpenseHistoryTransaction>,
	) => void,
	expenses: readonly ExpenseWithMonthlyCLPPriceType[],
	toChf: ((amount: number) => number) | undefined,
) {
	return [
		columnHelper.display({
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(checked) =>
						table.toggleAllPageRowsSelected(Boolean(checked))
					}
					aria-label="Select all transactions"
					className="mr-4"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
					aria-label={`Select ${row.original.description}`}
					className="mr-4"
				/>
			),
			size: 36,
			enableSorting: false,
			enableHiding: false,
		}),
		columnHelper.accessor("bookedAt", {
			header: "Booked",
			size: 180,
			cell: ({ getValue }) => (
				<span className="text-muted-foreground text-nowrap">
					{formatDate(getValue())}
				</span>
			),
		}),
		columnHelper.accessor("description", {
			header: "Description",
			size: 520,
			cell: ({ getValue, row }) => {
				const transaction = row.original;
				return (
					<InlineInput
						value={getValue()}
						ariaLabel={`description for ${getValue()}`}
						onCommit={(description) => onEdit(transaction, { description })}
						className="h-10 min-w-64 max-w-120"
						displayClassName="h-10 text-base"
						inputClassName="h-10"
					/>
				);
			},
		}),
		columnHelper.accessor("amount", {
			header: `Amount (${currency})`,
			size: 150,
			cell: ({ getValue, row }) =>
				toChf ? (
					<InlineInput
						type="number"
						min={0}
						value={getValue()}
						displayValue={formatCurrency(getValue(), currency)}
						ariaLabel={`amount for ${row.original.description}`}
						displayClassName="font-mono"
						inputClassName="font-mono"
						onCommit={(amount) =>
							onEdit(row.original, { amount: toChf(amount) }, { amount })
						}
					/>
				) : (
					<span className="font-mono">
						{formatCurrency(getValue(), currency)}
					</span>
				),
		}),
		columnHelper.accessor((row) => row.expense, {
			id: "association",
			header: "Association",
			size: 240,
			cell: ({ getValue, row }) => {
				const expense = getValue();
				return (
					<InlineCombobox
						value={expense?.id ?? null}
						aria-label={`association for ${row.original.description}`}
						align="start"
						options={[
							{
								value: null,
								label: (
									<span className="italic text-muted-foreground">Other</span>
								),
								searchValue: "Other",
							},
							...expenses.map((option) => ({
								value: option.id as number | null,
								label: option.name,
								searchValue: option.name,
							})),
						]}
						selectedValueFormater={(selectedId) => {
							const selectedExpense = expenses.find(
								(option) => option.id === selectedId,
							);
							return selectedExpense ? (
								selectedExpense.name
							) : (
								<span className="italic text-muted-foreground">Other</span>
							);
						}}
						onChange={(expenseId) => {
							const selectedExpense = expenses.find(
								(option) => option.id === expenseId,
							);
							onEdit(
								row.original,
								{ expenseId },
								{
									expense: selectedExpense
										? {
												id: selectedExpense.id,
												name: selectedExpense.name,
											}
										: null,
									...(selectedExpense
										? {
												category: selectedExpense.category,
												type: selectedExpense.type,
											}
										: {}),
								},
							);
						}}
					/>
				);
			},
			filterFn: (row, _columnId, filterValue) =>
				!filterValue || row.original.expense === null,
		}),
		columnHelper.accessor("category", {
			header: "Category",
			size: 200,
			filterFn: (row, columnId, filterValue) =>
				(
					filterValue as NonNullable<ExpenseHistoryTransaction["category"]>[]
				).includes(row.getValue(columnId)),
			cell: ({ getValue, row }) => {
				const category = getValue();
				return (
					<InlineCombobox
						value={category}
						aria-label={`category for ${row.original.description}`}
						align="start"
						options={[
							{
								value: null,
								label: (
									<span className="italic text-muted-foreground">
										Unclassified
									</span>
								),
								searchValue: "Unclassified",
							},
							...expenseCategoryEnum.enumValues.map((option) => ({
								value: option as typeof category,
								label: <ExpenseCategoryBadge value={option} />,
								searchValue: option,
							})),
						]}
						selectedValueFormater={(selectedCategory) =>
							selectedCategory ? (
								<ExpenseCategoryBadge value={selectedCategory} />
							) : (
								<span className="italic text-muted-foreground">
									Unclassified
								</span>
							)
						}
						onChange={(nextCategory) =>
							onEdit(row.original, { category: nextCategory })
						}
					/>
				);
			},
		}),
		columnHelper.accessor("type", {
			header: "Type",
			size: 160,
			cell: ({ getValue, row }) => {
				const type = getValue();
				return (
					<InlineCombobox
						value={type}
						aria-label={`type for ${row.original.description}`}
						align="start"
						options={[
							{
								value: null,
								label: (
									<span className="italic text-muted-foreground">
										Unclassified
									</span>
								),
								searchValue: "Unclassified",
							},
							...expenseTypeEnum.enumValues.map((option) => ({
								value: option as typeof type,
								label: (
									<IconBadge
										icon={mapTypeToIcon(option)}
										label={option}
										className={typeToColorClass(option)}
									/>
								),
								searchValue: option,
							})),
						]}
						selectedValueFormater={(selectedType) =>
							selectedType ? (
								<IconBadge
									icon={mapTypeToIcon(selectedType)}
									label={selectedType}
									className={typeToColorClass(selectedType)}
								/>
							) : (
								<span className="italic text-muted-foreground">
									Unclassified
								</span>
							)
						}
						onChange={(nextType) => onEdit(row.original, { type: nextType })}
					/>
				);
			},
		}),
	];
}
