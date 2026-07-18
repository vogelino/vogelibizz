import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expense-history/transactions/batch")(
	{
		server: {
			handlers: {
				DELETE: async ({ request }) => {
					const { batchDeleteExpenseHistoryTransactionsHandler } = await import(
						"@/server/expenseHistory/mutateHttp"
					);
					return batchDeleteExpenseHistoryTransactionsHandler(request);
				},
			},
		},
	},
);
