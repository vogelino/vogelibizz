import { asc, desc, eq } from "drizzle-orm";
import db from "@/db";
import { expenseMonths, expenses, expenseTransactions } from "@/db/schema";
import type {
	ExpenseHistoryMonthDetail,
	ExpenseHistoryMonthSummary,
} from "@/utility/expenseHistoryContracts";

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

	const rows = await db
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
		);

	const transactions = rows.map(
		({ expenseId, expenseName, ...transaction }) => ({
			...transaction,
			expense:
				expenseId !== null && expenseName !== null
					? { id: expenseId, name: expenseName }
					: null,
		}),
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
		month: monthRow,
		transactions,
		summary: { total, matched, other },
	};
}
