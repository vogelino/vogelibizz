import { describe, expect, test } from "bun:test";
import type { ExpenseHistoryTransaction } from "@/utility/expenseHistoryContracts";
import {
	ExpenseHistoryConflictError,
	ExpenseHistoryNotFoundError,
} from "./mutateExpenseHistory";
import { createExpenseHistoryMutationHandlers } from "./mutateHttp";

const transaction: ExpenseHistoryTransaction = {
	id: 7,
	bookedAt: "2026-06-03",
	valueDate: null,
	description: "Edited",
	amount: 0,
	originalDescription: "Immutable",
	originalAmount: 15,
	category: "Software",
	type: "Personal",
	expense: null,
	lastModified: "new-token",
};

function request(body: unknown, method = "PATCH") {
	return new Request(
		"https://example.test/api/expense-history/transactions/7",
		{
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		},
	);
}

describe("expense history mutation HTTP API", () => {
	test("requires administrator authentication", async () => {
		const handlers = createExpenseHistoryMutationHandlers({
			authorize: async () => false,
			mutate: async () => transaction,
			createAndAssociate: async () => transaction,
		});
		expect((await handlers.patch(request({}), "7")).status).toBe(401);
	});

	test("accepts CHF zero and forwards only editable fields with a concurrency token", async () => {
		let received: unknown;
		const handlers = createExpenseHistoryMutationHandlers({
			authorize: async () => true,
			mutate: async (_id, input) => {
				received = input;
				return transaction;
			},
			createAndAssociate: async () => transaction,
		});
		const response = await handlers.patch(
			request({ lastModified: "old-token", amount: 0, expenseId: 4 }),
			"7",
		);
		expect(response.status).toBe(200);
		expect(received).toEqual({
			lastModified: "old-token",
			amount: 0,
			expenseId: 4,
		});
	});

	test("rejects negative, invalid, and immutable bank values", async () => {
		const handlers = createExpenseHistoryMutationHandlers({
			authorize: async () => true,
			mutate: async () => transaction,
			createAndAssociate: async () => transaction,
		});
		for (const body of [
			{ lastModified: "token", amount: -1 },
			{ lastModified: "token", amount: "nope" },
			{ lastModified: "token", originalAmount: 0 },
			{ lastModified: "token", originalDescription: "changed" },
		]) {
			expect((await handlers.patch(request(body), "7")).status).toBe(400);
		}
	});

	test("returns deliberate conflict and missing-resource errors", async () => {
		const conflict = createExpenseHistoryMutationHandlers({
			authorize: async () => true,
			mutate: async () => {
				throw new ExpenseHistoryConflictError("reload");
			},
			createAndAssociate: async () => transaction,
		});
		expect(
			(await conflict.patch(request({ lastModified: "old", amount: 1 }), "7"))
				.status,
		).toBe(409);
		const missing = createExpenseHistoryMutationHandlers({
			authorize: async () => true,
			mutate: async () => {
				throw new ExpenseHistoryNotFoundError("missing");
			},
			createAndAssociate: async () => transaction,
		});
		expect(
			(await missing.patch(request({ lastModified: "old", amount: 1 }), "7"))
				.status,
		).toBe(404);
	});

	test("create-and-associate contract fixes Monthly CHF fields server-side", async () => {
		let received: unknown;
		const handlers = createExpenseHistoryMutationHandlers({
			authorize: async () => true,
			mutate: async () => transaction,
			createAndAssociate: async (_id, input) => {
				received = input;
				return { ...transaction, expense: { id: 9, name: input.name } };
			},
		});
		const response = await handlers.createExpense(
			request(
				{
					lastModified: "old",
					name: "Edited",
					originalPrice: 0,
					category: "Software",
					type: "Personal",
				},
				"POST",
			),
			"7",
		);
		expect(response.status).toBe(200);
		expect(received).toEqual({
			lastModified: "old",
			name: "Edited",
			originalPrice: 0,
			category: "Software",
			type: "Personal",
		});
	});
});
