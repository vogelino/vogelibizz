import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expense-history/overview")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const { getExpenseOverviewSummaryHandler } = await import(
					"@/server/expenseHistory/readHttp"
				);
				return getExpenseOverviewSummaryHandler(request);
			},
		},
	},
});
