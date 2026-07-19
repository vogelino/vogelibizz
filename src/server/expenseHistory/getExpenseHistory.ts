import { asc, count, desc, eq, exists, sql, sum } from "drizzle-orm";
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
	month: string | null,
	{ offset = 0, limit = 50 }: { offset?: number; limit?: number } = {},
): Promise<ExpenseHistoryMonthDetail | null> {
	const [monthRow] = month
		? await db
				.select({
					month: expenseMonths.month,
					importedAt: expenseMonths.imported_at,
					importedDebitCount: expenseMonths.importedDebitCount,
					skippedCreditCount: expenseMonths.skippedCreditCount,
				})
				.from(expenseMonths)
				.where(eq(expenseMonths.month, month))
				.limit(1)
		: [null];
	if (month && !monthRow) return null;
	const monthCondition = month ? eq(expenseMonths.month, month) : undefined;

	const [rows, aggregateRows, rates, currency] = await Promise.all([
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
			.where(monthCondition)
			.orderBy(
				month
					? asc(expenseTransactions.bookedAt)
					: desc(expenseTransactions.bookedAt),
				month
					? asc(expenseTransactions.sourceOrder)
					: desc(expenseTransactions.sourceOrder),
			)
			.limit(limit)
			.offset(offset),
		db
			.select({
				totalCount: count(),
				total: sum(expenseTransactions.amount),
				matched: sql<number>`sum(case when ${expenseTransactions.expenseId} is not null then ${expenseTransactions.amount} else 0 end)`,
				other: sql<number>`sum(case when ${expenseTransactions.expenseId} is null then ${expenseTransactions.amount} else 0 end)`,
			})
			.from(expenseTransactions)
			.innerJoin(
				expenseMonths,
				eq(expenseTransactions.expenseMonthId, expenseMonths.id),
			)
			.where(monthCondition),
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
	const aggregate = aggregateRows[0];
	const convertTotal = (value: string | number | null | undefined) =>
		getValueInTargetCurrencyPerMonth({
			value: Number(value ?? 0),
			currency: "CHF",
			billingRate: "Monthly",
			rates,
			targetCurrency: currency,
		}) ?? Number(value ?? 0);
	const totalCount = aggregate?.totalCount ?? 0;
	return {
		currency,
		month: monthRow,
		transactions,
		summary: {
			total: convertTotal(aggregate?.total),
			matched: convertTotal(aggregate?.matched),
			other: convertTotal(aggregate?.other),
		},
		totalCount,
		nextOffset: offset + rows.length < totalCount ? offset + rows.length : null,
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
