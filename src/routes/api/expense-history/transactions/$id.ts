import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expense-history/transactions/$id")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				const { getExpenseHistoryTransactionHandler } = await import(
					"@/server/expenseHistory/readHttp"
				);
				return getExpenseHistoryTransactionHandler(request, params.id);
			},
			PATCH: async ({ request, params }) => {
				const { patchExpenseHistoryTransactionHandler } = await import(
					"@/server/expenseHistory/mutateHttp"
				);
				return patchExpenseHistoryTransactionHandler(request, params.id);
			},
		},
	},
});
