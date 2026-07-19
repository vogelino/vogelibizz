import { asc, desc, eq, exists } from "drizzle-orm";
import db from "@/db";
import { expenseMonths, expenses, expenseTransactions } from "@/db/schema";
import {
	getExchangeRates,
	getTargetCurrency,
	getValueInTargetCurrencyPerMonth,
} from "@/utility/expenseFetchUtil";
import { calculateExpenseHistorySummary } from "@/utility/expenseHistoryCalculations";
import type {
	ExpenseHistoryMonthDetail,
	ExpenseHistoryMonthSummary,
	ExpenseHistoryTransactionDetail,
	ExpenseOverviewSummary,
} from "@/utility/expenseHistoryContracts";

export async function getExpenseHistoryTransaction(
	id: number,
): Promise<ExpenseHistoryTransactionDetail | null> {
	const [row] = await db
		.select({
			month: expenseMonths.month,
			id: expenseTransactions.id,
			bookedAt: expenseTransactions.bookedAt,
			valueDate: expenseTransactions.valueDate,
			description: expenseTransactions.description,
			amount: expenseTransactions.amount,
			originalDescription: expenseTransactions.originalDescription,
			originalAmount: expenseTransactions.originalAmount,
			lastModified: expenseTransactions.last_modified,
			category: expenseTransactions.category,
			type: expenseTransactions.type,
			expenseId: expenses.id,
			expenseName: expenses.name,
		})
		.from(expenseTransactions)
		.innerJoin(
			expenseMonths,
			eq(expenseTransactions.expenseMonthId, expenseMonths.id),
		)
		.leftJoin(expenses, eq(expenseTransactions.expenseId, expenses.id))
		.where(eq(expenseTransactions.id, id))
		.limit(1);
	if (!row) return null;
	const { month, expenseId, expenseName, ...transaction } = row;
	return {
		month,
		transaction: {
			...transaction,
			expense:
				expenseId !== null && expenseName !== null
					? { id: expenseId, name: expenseName }
					: null,
		},
	};
}

export async function getExpenseHistoryMonths(): Promise<
	ExpenseHistoryMonthSummary[]
> {
	return db
		.select({
			month: expenseMonths.month,
			importedAt: expenseMonths.imported_at,
			importedDebitCount: expenseMonths.importedDebitCount,
			skippedCreditCount: expenseMonths.skippedCreditCount,
		})
		.from(expenseMonths)
		.where(
			exists(
				db
					.select({ id: expenseTransactions.id })
					.from(expenseTransactions)
					.where(eq(expenseTransactions.expenseMonthId, expenseMonths.id)),
			),
		)
		.orderBy(desc(expenseMonths.month));
}

export async function getExpenseHistoryMonth(
	month: string,
): Promise<ExpenseHistoryMonthDetail | null> {
	const [monthRow] = await db
		.select({
			month: expenseMonths.month,
			importedAt: expenseMonths.imported_at,
			importedDebitCount: expenseMonths.importedDebitCount,
			skippedCreditCount: expenseMonths.skippedCreditCount,
		})
		.from(expenseMonths)
		.where(eq(expenseMonths.month, month))
		.limit(1);
	if (!monthRow) return null;

	const [rows, rates, currency] = await Promise.all([
		db
			.select({
				id: expenseTransactions.id,
				bookedAt: expenseTransactions.bookedAt,
				valueDate: expenseTransactions.valueDate,
				description: expenseTransactions.description,
				amount: expenseTransactions.amount,
				originalDescription: expenseTransactions.originalDescription,
				originalAmount: expenseTransactions.originalAmount,
				lastModified: expenseTransactions.last_modified,
				category: expenseTransactions.category,
				type: expenseTransactions.type,
				expenseId: expenses.id,
				expenseName: expenses.name,
			})
			.from(expenseTransactions)
			.innerJoin(
				expenseMonths,
				eq(expenseTransactions.expenseMonthId, expenseMonths.id),
			)
			.leftJoin(expenses, eq(expenseTransactions.expenseId, expenses.id))
			.where(eq(expenseMonths.month, month))
			.orderBy(
				asc(expenseTransactions.bookedAt),
				asc(expenseTransactions.sourceOrder),
			),
		getExchangeRates(),
		getTargetCurrency(),
	]);

	const transactions = rows.map(
		({ expenseId, expenseName, ...transaction }) => {
			const amount =
				getValueInTargetCurrencyPerMonth({
					value: transaction.amount,
					currency: "CHF",
					billingRate: "Monthly",
					rates,
					targetCurrency: currency,
				}) ?? transaction.amount;
			return {
				...transaction,
				amount,
				expense:
					expenseId !== null && expenseName !== null
						? { id: expenseId, name: expenseName }
						: null,
			};
		},
	);
	const total = transactions.reduce(
		(sum, transaction) => sum + transaction.amount,
		0,
	);
	const matched = transactions.reduce(
		(sum, transaction) => sum + (transaction.expense ? transaction.amount : 0),
		0,
	);
	const other = transactions.reduce(
		(sum, transaction) => sum + (transaction.expense ? 0 : transaction.amount),
		0,
	);
	return {
		currency,
		month: monthRow,
		transactions,
		summary: { total, matched, other },
	};
}

export async function getExpenseOverviewSummary(): Promise<ExpenseOverviewSummary> {
	const [configuredExpenses, importedMonths, transactions, rates, currency] =
		await Promise.all([
			db.query.expenses.findMany(),
			db
				.select({ id: expenseMonths.id })
				.from(expenseMonths)
				.where(
					exists(
						db
							.select({ id: expenseTransactions.id })
							.from(expenseTransactions)
							.where(eq(expenseTransactions.expenseMonthId, expenseMonths.id)),
					),
				),
			db
				.select({
					expenseMonthId: expenseTransactions.expenseMonthId,
					expenseId: expenseTransactions.expenseId,
					amount: expenseTransactions.amount,
				})
				.from(expenseTransactions),
			getExchangeRates(),
			getTargetCurrency(),
		]);

	const toTargetMonthlyAmount = (
		value: number,
		originalCurrency: (typeof configuredExpenses)[number]["originalCurrency"],
		billingRate: (typeof configuredExpenses)[number]["rate"],
	) =>
		getValueInTargetCurrencyPerMonth({
			value,
			currency: originalCurrency,
			billingRate,
			rates,
			targetCurrency: currency,
		}) ?? value;

	return {
		currency,
		...calculateExpenseHistorySummary({
			importedMonths,
			configuredExpenses: configuredExpenses.map((expense) => ({
				expenseId: expense.id,
				monthlyAmount: toTargetMonthlyAmount(
					expense.originalPrice,
					expense.originalCurrency,
					expense.rate,
				),
			})),
			transactions: transactions.map((transaction) => ({
				...transaction,
				amount: toTargetMonthlyAmount(transaction.amount, "CHF", "Monthly"),
			})),
		}),
	};
}
