import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expense-history/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getExpenseDashboardHandler } = await import("@/server/expenseHistory/readHttp");
        return getExpenseDashboardHandler(request);
      },
    },
  },
});
