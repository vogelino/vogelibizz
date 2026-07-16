import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expense-history/transactions/$id")({
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const { patchExpenseHistoryTransactionHandler } = await import(
					"@/server/expenseHistory/mutateHttp"
				);
				return patchExpenseHistoryTransactionHandler(request, params.id);
			},
		},
	},
});
