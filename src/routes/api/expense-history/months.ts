import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expense-history/months")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const { getExpenseHistoryMonthsHandler } = await import(
					"@/server/expenseHistory/readHttp"
				);
				return getExpenseHistoryMonthsHandler(request);
			},
		},
	},
});
