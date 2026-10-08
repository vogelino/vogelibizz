import { and, eq, inArray, max } from "drizzle-orm";
import db from "@/db";
import { expenseMonths, expenses, expenseTransactions } from "@/db/schema";
import type {
	ExpenseHistoryCreateExpense,
	ExpenseHistoryTransaction,
	ExpenseHistoryTransactionMutation,
} from "@/utility/expenseHistoryContracts";
import { isHighConfidenceExpenseMatch } from "@/utility/expenseMatchSuggestions";
import { expectedChfAmount } from "./expenseMatches";

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
			occurredAt: expenseTransactions.occurredAt,
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

async function getBookedAtLocationChange(
	id: number,
	bookedAt: string,
	nextSourceOrderByMonth?: Map<number, number>,
) {
	const targetMonth = bookedAt.slice(0, 7);
	const [currentLocation] = await db
		.select({
			expenseMonthId: expenseTransactions.expenseMonthId,
			month: expenseMonths.month,
		})
		.from(expenseTransactions)
		.innerJoin(
			expenseMonths,
			eq(expenseTransactions.expenseMonthId, expenseMonths.id),
		)
		.where(eq(expenseTransactions.id, id))
		.limit(1);
	if (!currentLocation)
		throw new ExpenseHistoryNotFoundError("Transaction not found.");
	if (currentLocation.month === targetMonth) return {};

	const [targetLocation] = await db
		.select({ id: expenseMonths.id })
		.from(expenseMonths)
		.where(eq(expenseMonths.month, targetMonth))
		.limit(1);
	if (!targetLocation) {
		throw new ExpenseHistoryNotFoundError(
			`Import ${targetMonth} before moving a transaction into that month.`,
		);
	}
	let sourceOrder = nextSourceOrderByMonth?.get(targetLocation.id);
	if (sourceOrder === undefined) {
		const [order] = await db
			.select({ value: max(expenseTransactions.sourceOrder) })
			.from(expenseTransactions)
			.where(eq(expenseTransactions.expenseMonthId, targetLocation.id));
		sourceOrder = (order?.value ?? -1) + 1;
	}
	nextSourceOrderByMonth?.set(targetLocation.id, sourceOrder + 1);
	return {
		expenseMonthId: targetLocation.id,
		sourceOrder,
	};
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
	if (input.bookedAt !== undefined) {
		values.bookedAt = input.bookedAt;
		Object.assign(values, await getBookedAtLocationChange(id, input.bookedAt));
	}
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

export async function mutateExpenseHistoryTransactions(
	items: { id: number; change: ExpenseHistoryTransactionMutation }[],
) {
	type BatchStatement = Parameters<typeof db.batch>[0][number];
	const statements: BatchStatement[] = [];
	const nextSourceOrderByMonth = new Map<number, number>();
	for (const { id, change } of items) {
		await requireCurrent(id, change.lastModified);
		const values: Partial<typeof expenseTransactions.$inferInsert> = {
			last_modified: nextToken(change.lastModified),
		};
		if (change.bookedAt !== undefined) {
			values.bookedAt = change.bookedAt;
			Object.assign(
				values,
				await getBookedAtLocationChange(
					id,
					change.bookedAt,
					nextSourceOrderByMonth,
				),
			);
		}
		if (change.description !== undefined)
			values.description = change.description;
		if (change.amount !== undefined) values.amount = change.amount;
		if (change.category !== undefined) values.category = change.category;
		if (change.type !== undefined) values.type = change.type;
		if (change.expenseId !== undefined) {
			values.expenseId = change.expenseId;
			if (change.expenseId !== null) {
				const [expense] = await db
					.select({ category: expenses.category, type: expenses.type })
					.from(expenses)
					.where(eq(expenses.id, change.expenseId))
					.limit(1);
				if (!expense)
					throw new ExpenseHistoryNotFoundError("Recurring expense not found.");
				values.category = expense.category;
				values.type = expense.type;
			}
		}
		statements.push(
			db
				.update(expenseTransactions)
				.set(values)
				.where(
					and(
						eq(expenseTransactions.id, id),
						eq(expenseTransactions.last_modified, change.lastModified),
					),
				),
		);
	}
	await db.batch(statements as [BatchStatement, ...BatchStatement[]]);
	return { ids: items.map(({ id }) => id) };
}

export async function deleteExpenseHistoryTransaction(id: number) {
	const deleted = await db
		.delete(expenseTransactions)
		.where(eq(expenseTransactions.id, id))
		.returning({ id: expenseTransactions.id });
	if (deleted.length === 0) {
		throw new ExpenseHistoryNotFoundError("Transaction not found.");
	}
	return deleted[0];
}

export async function duplicateExpenseHistoryTransaction(id: number) {
	const [source] = await db
		.select()
		.from(expenseTransactions)
		.where(eq(expenseTransactions.id, id))
		.limit(1);
	if (!source) throw new ExpenseHistoryNotFoundError("Transaction not found.");
	const [order] = await db
		.select({ value: max(expenseTransactions.sourceOrder) })
		.from(expenseTransactions)
		.where(eq(expenseTransactions.expenseMonthId, source.expenseMonthId));
	const token = new Date().toISOString();
	const {
		id: _id,
		sourceOrder: _sourceOrder,
		created_at: _createdAt,
		...copy
	} = source;
	const [created] = await db
		.insert(expenseTransactions)
		.values({
			...copy,
			sourceOrder: (order?.value ?? -1) + 1,
			created_at: token,
			last_modified: token,
		})
		.returning({ id: expenseTransactions.id });
	const result = await readTransaction(created.id);
	if (!result) throw new ExpenseHistoryNotFoundError("Transaction not found.");
	return result;
}

export async function deleteExpenseHistoryTransactions(ids: number[]) {
	const deleted = await db
		.delete(expenseTransactions)
		.where(inArray(expenseTransactions.id, ids))
		.returning({ id: expenseTransactions.id });
	return { ids: deleted.map(({ id }) => id) };
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
	const matches = input.matches ?? [];
	if (matches.some(({ id: matchId }) => matchId === id)) {
		throw new ExpenseHistoryConflictError(
			"The starting transaction is already included.",
		);
	}
	if (matches.length > 0) {
		const expectedAmount = await expectedChfAmount(input);
		const rows = await db
			.select({
				id: expenseTransactions.id,
				lastModified: expenseTransactions.last_modified,
				expenseId: expenseTransactions.expenseId,
				description: expenseTransactions.description,
				amount: expenseTransactions.amount,
			})
			.from(expenseTransactions)
			.where(
				inArray(
					expenseTransactions.id,
					matches.map(({ id: matchId }) => matchId),
				),
			);
		const byId = new Map(rows.map((row) => [row.id, row]));
		if (
			input.rate === "One-time" ||
			!expectedAmount ||
			matches.some(({ id: matchId, lastModified }) => {
				const row = byId.get(matchId);
				return (
					!row ||
					row.expenseId !== null ||
					row.lastModified !== lastModified ||
					!isHighConfidenceExpenseMatch({
						name: current.description,
						expectedChfAmount: expectedAmount,
						description: row.description,
						amount: row.amount,
						foreignCurrency: input.originalCurrency !== "CHF",
					})
				);
			})
		) {
			throw new ExpenseHistoryConflictError(
				"Suggested transactions changed. Review the matches and try again.",
			);
		}
	}
	const claimedToken = nextToken(input.lastModified);
	const finalToken = nextToken(claimedToken);
	const createdAt = new Date().toISOString();
	const client = db.$client;
	const matchConditions = matches
		.map(() => "(id = ? and last_modified = ?)")
		.join(" or ");
	const matchGuard = matches.length
		? ` and (select count(*) from expense_transactions where expense_id is null and (${matchConditions})) = ?`
		: "";
	await client.batch([
		client
			.prepare(`update expense_transactions
				set last_modified = ?
				where id = ? and last_modified = ? and expense_id is null`)
			.bind(claimedToken, id, input.lastModified),
		client
			.prepare(`insert into expenses (
				name, category, type, rate, original_price, original_currency, created_at, last_modified
			) select ?, ?, ?, ?, ?, ?, ?, ?
			where exists (select 1 from expense_transactions where id = ? and last_modified = ?)${matchGuard}`)
			.bind(
				input.name,
				input.category,
				input.type,
				input.rate,
				input.originalPrice,
				input.originalCurrency,
				createdAt,
				createdAt,
				id,
				claimedToken,
				...matches.flatMap(({ id: matchId, lastModified }) => [
					matchId,
					lastModified,
				]),
				...(matches.length ? [matches.length] : []),
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
		...matches.map(({ id: matchId, lastModified }) =>
			client
				.prepare(`update expense_transactions set
			expense_id = (select id from expenses where name = ? and created_at = ?),
			category = ?, type = ?, last_modified = ?
			where id = ? and last_modified = ? and expense_id is null
			and exists (select 1 from expenses where name = ? and created_at = ?)`)
				.bind(
					input.name,
					createdAt,
					input.category,
					input.type,
					createdAt,
					matchId,
					lastModified,
					input.name,
					createdAt,
				),
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
