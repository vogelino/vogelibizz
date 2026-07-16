import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expense-history/import/commit")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const { commitExpenseHistoryImportHandler } = await import(
					"@/server/expenseHistory/importHttp"
				);
				return commitExpenseHistoryImportHandler(request);
			},
		},
	},
});
