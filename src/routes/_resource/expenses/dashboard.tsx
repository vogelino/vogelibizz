import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { expenseDashboardComparisonValues } from "@/features/expenses/dashboard/expenseDashboardComparison";
import ExpenseDashboardPage from "@/features/expenses/dashboard/ExpenseDashboardPage";
import { expenseDashboardQueryOptions } from "@/utility/data/queryOptions";
import { expenseHistoryMonthKeySchema } from "@/utility/expenseHistoryContracts";

export const Route = createFileRoute("/_resource/expenses/dashboard")({
  validateSearch: z.object({
    month: expenseHistoryMonthKeySchema.optional().catch(undefined),
    compare: z.enum(expenseDashboardComparisonValues).optional().catch(undefined),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(expenseDashboardQueryOptions()),
  component: ExpenseDashboardPage,
});
