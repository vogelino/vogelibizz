import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expense-history/import/preview")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const { previewExpenseHistoryImportHandler } = await import(
					"@/server/expenseHistory/importHttp"
				);
				return previewExpenseHistoryImportHandler(request);
			},
		},
	},
});
