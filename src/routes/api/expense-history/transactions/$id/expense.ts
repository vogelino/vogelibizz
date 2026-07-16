import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/api/expense-history/transactions/$id/expense",
)({
	server: {
		handlers: {
			POST: async ({ request, params }) => {
				const { createExpenseFromTransactionHandler } = await import(
					"@/server/expenseHistory/mutateHttp"
				);
				return createExpenseFromTransactionHandler(request, params.id);
			},
		},
	},
});
