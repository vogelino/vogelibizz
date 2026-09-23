import { and, between, desc, eq, inArray, isNull } from "drizzle-orm";
import type { z } from "zod";
import db from "@/db";
import { expenses, expenseTransactions } from "@/db/schema";
import {
	getExchangeRates,
	getValueInTargetCurrencyPerMonth,
} from "@/utility/expenseFetchUtil";
import {
	type createExpenseWithMatchesSchema,
	type editExpenseWithMatchesSchema,
	type expenseMatchRequestSchema,
	isHighConfidenceExpenseMatch,
} from "@/utility/expenseMatchSuggestions";

type MatchRequest = z.infer<typeof expenseMatchRequestSchema>;
type CreateRequest = z.infer<typeof createExpenseWithMatchesSchema>;
type EditRequest = z.infer<typeof editExpenseWithMatchesSchema>;

export async function expectedChfAmount(input: MatchRequest) {
	if (input.originalCurrency === "CHF") return input.originalPrice;
	const rates = await getExchangeRates();
	const converted = getValueInTargetCurrencyPerMonth({
		value: input.originalPrice,
		currency: input.originalCurrency,
		targetCurrency: "CHF",
		billingRate: "Monthly",
		rates,
	});
	return converted && converted > 0 ? converted : null;
}

export async function getExpenseMatchSuggestions(input: MatchRequest) {
	if (input.rate === "One-time") return [];
	const expectedAmount = await expectedChfAmount(input);
	if (!expectedAmount) return [];
	const tolerance = Math.max(
		0.5,
		expectedAmount * (input.originalCurrency === "CHF" ? 0.01 : 0.03),
	);
	const candidates = await db
		.select({
			id: expenseTransactions.id,
			lastModified: expenseTransactions.last_modified,
			bookedAt: expenseTransactions.bookedAt,
			description: expenseTransactions.description,
			amount: expenseTransactions.amount,
		})
		.from(expenseTransactions)
		.where(
			and(
				isNull(expenseTransactions.expenseId),
				between(
					expenseTransactions.amount,
					expectedAmount - tolerance,
					expectedAmount + tolerance,
				),
			),
		)
		.orderBy(desc(expenseTransactions.bookedAt))
		.limit(1_000);
	return candidates
		.filter((candidate) =>
			isHighConfidenceExpenseMatch({
				name: input.name,
				expectedChfAmount: expectedAmount,
				description: candidate.description,
				amount: candidate.amount,
				foreignCurrency: input.originalCurrency !== "CHF",
			}),
		)
		.slice(0, 100);
}

export class ExpenseMatchConflictError extends Error {}

async function validateSelectedMatches(input: CreateRequest) {
	const selected = await db
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
				input.matches.map(({ id }) => id),
			),
		);
	const byId = new Map(
		selected.map((transaction) => [transaction.id, transaction]),
	);
	const expectedAmount = await expectedChfAmount(input);
	if (
		input.rate === "One-time" ||
		!expectedAmount ||
		input.matches.some(({ id, lastModified }) => {
			const transaction = byId.get(id);
			return (
				!transaction ||
				transaction.expenseId !== null ||
				transaction.lastModified !== lastModified ||
				!isHighConfidenceExpenseMatch({
					name: input.name,
					expectedChfAmount: expectedAmount,
					description: transaction.description,
					amount: transaction.amount,
					foreignCurrency: input.originalCurrency !== "CHF",
				})
			);
		})
	) {
		throw new ExpenseMatchConflictError(
			"The suggested transactions changed. Review the matches and try again.",
		);
	}
	return selected;
}

export async function createExpenseWithMatches(input: CreateRequest) {
	await validateSelectedMatches(input);
	const now = new Date().toISOString();
	const client = db.$client;
	const conditions = input.matches
		.map(() => "(id = ? AND last_modified = ?)")
		.join(" OR ");
	const insert = client
		.prepare(`INSERT INTO expenses (
			name, category, type, rate, original_price, original_currency, created_at, last_modified
		) SELECT ?, ?, ?, ?, ?, ?, ?, ?
		WHERE (SELECT COUNT(*) FROM expense_transactions
			WHERE expense_id IS NULL AND (${conditions})) = ?`)
		.bind(
			input.name,
			input.category,
			input.type,
			input.rate,
			input.originalPrice,
			input.originalCurrency,
			now,
			now,
			...input.matches.flatMap(({ id, lastModified }) => [id, lastModified]),
			input.matches.length,
		);
	const updates = input.matches.map(({ id, lastModified }) =>
		client
			.prepare(`UPDATE expense_transactions SET
				expense_id = (SELECT id FROM expenses WHERE name = ? AND created_at = ?),
				category = ?, type = ?, last_modified = ?
			WHERE id = ? AND last_modified = ? AND expense_id IS NULL
				AND EXISTS (SELECT 1 FROM expenses WHERE name = ? AND created_at = ?)`)
			.bind(
				input.name,
				now,
				input.category,
				input.type,
				now,
				id,
				lastModified,
				input.name,
				now,
			),
	);
	await client.batch([insert, ...updates]);
	const [created] = await db
		.select({ id: expenses.id })
		.from(expenses)
		.where(and(eq(expenses.name, input.name), eq(expenses.created_at, now)))
		.limit(1);
	if (!created) {
		throw new ExpenseMatchConflictError(
			"The suggested transactions changed. Review the matches and try again.",
		);
	}
	return { expenseId: created.id, associatedCount: input.matches.length };
}

export async function editExpenseWithMatches(input: EditRequest) {
	const [current] = await db
		.select({ lastModified: expenses.last_modified })
		.from(expenses)
		.where(eq(expenses.id, input.id))
		.limit(1);
	if (!current || current.lastModified !== input.lastModified) {
		throw new ExpenseMatchConflictError(
			"This expense changed. Reload it and try again.",
		);
	}
	await validateSelectedMatches(input);
	const now = new Date(
		Math.max(Date.now(), Date.parse(input.lastModified) + 1),
	).toISOString();
	const client = db.$client;
	const conditions = input.matches
		.map(() => "(id = ? AND last_modified = ?)")
		.join(" OR ");
	const updateExpense = client
		.prepare(`UPDATE expenses SET
			name = ?, category = ?, type = ?, rate = ?, original_price = ?,
			original_currency = ?, last_modified = ?
		WHERE id = ? AND last_modified = ?
			AND (SELECT COUNT(*) FROM expense_transactions
				WHERE expense_id IS NULL AND (${conditions})) = ?`)
		.bind(
			input.name,
			input.category,
			input.type,
			input.rate,
			input.originalPrice,
			input.originalCurrency,
			now,
			input.id,
			input.lastModified,
			...input.matches.flatMap(({ id, lastModified }) => [id, lastModified]),
			input.matches.length,
		);
	const updates = input.matches.map(({ id, lastModified }) =>
		client
			.prepare(`UPDATE expense_transactions SET
				expense_id = ?, category = ?, type = ?, last_modified = ?
			WHERE id = ? AND last_modified = ? AND expense_id IS NULL
				AND EXISTS (SELECT 1 FROM expenses WHERE id = ? AND last_modified = ?)`)
			.bind(
				input.id,
				input.category,
				input.type,
				now,
				id,
				lastModified,
				input.id,
				now,
			),
	);
	const results = (await client.batch([updateExpense, ...updates])) as Array<{
		meta: { changes?: number };
	}>;
	if (
		Number(results[0].meta.changes) !== 1 ||
		updates.some((_, i) => Number(results[i + 1].meta.changes) !== 1)
	) {
		throw new ExpenseMatchConflictError(
			"The expense or suggested transactions changed. Review the matches and try again.",
		);
	}
	return { expenseId: input.id, associatedCount: input.matches.length };
}
