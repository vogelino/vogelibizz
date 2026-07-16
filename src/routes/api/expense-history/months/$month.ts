import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expense-history/months/$month")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				const { getExpenseHistoryMonthHandler } = await import(
					"@/server/expenseHistory/readHttp"
				);
				return getExpenseHistoryMonthHandler(request, params.month);
			},
		},
	},
});
