import { and, eq } from "drizzle-orm";
import db from "@/db";
import { expenses, expenseTransactions } from "@/db/schema";
import type {
	ExpenseHistoryCreateExpense,
	ExpenseHistoryTransaction,
	ExpenseHistoryTransactionMutation,
} from "@/utility/expenseHistoryContracts";

export class ExpenseHistoryConflictError extends Error {}
export class ExpenseHistoryNotFoundError extends Error {}

function nextToken(previous: string) {
	const now = new Date().toISOString();
	return now === previous
		? new Date(new Date(now).getTime() + 1).toISOString()
		: now;
}

async function readTransaction(
	id: number,
): Promise<ExpenseHistoryTransaction | null> {
	const [row] = await db
		.select({
			id: expenseTransactions.id,
			bookedAt: expenseTransactions.bookedAt,
			valueDate: expenseTransactions.valueDate,
			description: expenseTransactions.description,
			amount: expenseTransactions.amount,
			originalDescription: expenseTransactions.originalDescription,
			originalAmount: expenseTransactions.originalAmount,
			category: expenseTransactions.category,
			type: expenseTransactions.type,
			lastModified: expenseTransactions.last_modified,
			expenseId: expenses.id,
			expenseName: expenses.name,
		})
		.from(expenseTransactions)
		.leftJoin(expenses, eq(expenseTransactions.expenseId, expenses.id))
		.where(eq(expenseTransactions.id, id))
		.limit(1);
	if (!row) return null;
	const { expenseId, expenseName, ...transaction } = row;
	return {
		...transaction,
		expense:
			expenseId !== null && expenseName !== null
				? { id: expenseId, name: expenseName }
				: null,
	};
}

async function requireCurrent(id: number, expected: string) {
	const current = await readTransaction(id);
	if (!current) throw new ExpenseHistoryNotFoundError("Transaction not found.");
	if (current.lastModified !== expected) {
		throw new ExpenseHistoryConflictError(
			"This transaction changed elsewhere. Reloaded values must be reviewed before saving again.",
		);
	}
	return current;
}

export async function mutateExpenseHistoryTransaction(
	id: number,
	input: ExpenseHistoryTransactionMutation,
) {
	await requireCurrent(id, input.lastModified);
	const token = nextToken(input.lastModified);
	const values: Partial<typeof expenseTransactions.$inferInsert> = {
		last_modified: token,
	};
	if (input.description !== undefined) values.description = input.description;
	if (input.amount !== undefined) values.amount = input.amount;
	if (input.category !== undefined) values.category = input.category;
	if (input.type !== undefined) values.type = input.type;
	if (input.expenseId !== undefined) {
		values.expenseId = input.expenseId;
		if (input.expenseId !== null) {
			const [expense] = await db
				.select({ category: expenses.category, type: expenses.type })
				.from(expenses)
				.where(eq(expenses.id, input.expenseId))
				.limit(1);
			if (!expense)
				throw new ExpenseHistoryNotFoundError("Recurring expense not found.");
			values.category = expense.category;
			values.type = expense.type;
		}
	}
	const updated = await db
		.update(expenseTransactions)
		.set(values)
		.where(
			and(
				eq(expenseTransactions.id, id),
				eq(expenseTransactions.last_modified, input.lastModified),
			),
		)
		.returning({ id: expenseTransactions.id });
	if (updated.length === 0) await requireCurrent(id, input.lastModified);
	const result = await readTransaction(id);
	if (!result) throw new ExpenseHistoryNotFoundError("Transaction not found.");
	return result;
}

export async function createAndAssociateExpense(
	id: number,
	input: ExpenseHistoryCreateExpense,
) {
	const current = await requireCurrent(id, input.lastModified);
	if (current.expense) {
		throw new ExpenseHistoryConflictError(
			"This transaction is already associated. Reload before creating an expense.",
		);
	}
	const claimedToken = nextToken(input.lastModified);
	const finalToken = nextToken(claimedToken);
	const createdAt = new Date().toISOString();
	const client = db.$client;
	await client.batch([
		client
			.prepare(`update expense_transactions
				set last_modified = ?
				where id = ? and last_modified = ? and expense_id is null`)
			.bind(claimedToken, id, input.lastModified),
		client
			.prepare(`insert into expenses (
				name, category, type, rate, original_price, original_currency, created_at, last_modified
			) select ?, ?, ?, 'Monthly', ?, 'CHF', ?, ?
			where exists (select 1 from expense_transactions where id = ? and last_modified = ?)`)
			.bind(
				input.name,
				input.category,
				input.type,
				input.originalPrice,
				createdAt,
				createdAt,
				id,
				claimedToken,
			),
		client
			.prepare(`update expense_transactions
				set expense_id = (select id from expenses where name = ?),
					category = ?, type = ?, last_modified = ?
				where id = ? and last_modified = ?`)
			.bind(
				input.name,
				input.category,
				input.type,
				finalToken,
				id,
				claimedToken,
			),
	]);
	const result = await readTransaction(id);
	if (!result) throw new ExpenseHistoryNotFoundError("Transaction not found.");
	if (result.lastModified !== finalToken || !result.expense) {
		throw new ExpenseHistoryConflictError(
			"This transaction changed elsewhere. No recurring expense was created.",
		);
	}
	return result;
}
