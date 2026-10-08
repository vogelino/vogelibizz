import {
	createFileRoute,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { z } from "zod";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import ExpenseHistoryPage from "@/features/expenses/ExpenseHistoryPage";
import { expenseHistoryMonthsQueryOptions } from "@/utility/data/queryOptions";
import { expenseHistoryMonthKeySchema } from "@/utility/expenseHistoryContracts";

const historySearchSchema = z.object({
	q: z.string().trim().min(1).optional().catch(undefined),
	month: expenseHistoryMonthKeySchema.optional().catch(undefined),
	category: z
		.array(z.enum(expenseCategoryEnum.enumValues))
		.optional()
		.catch(undefined),
	type: z
		.enum(["All types", ...expenseTypeEnum.enumValues, "Unclassified"])
		.optional()
		.catch(undefined),
	uncategorizedOnly: z.boolean().optional().catch(undefined),
	fromMonth: expenseHistoryMonthKeySchema.optional().catch(undefined),
	toMonth: expenseHistoryMonthKeySchema.optional().catch(undefined),
});

export const Route = createFileRoute("/_resource/expenses/history")({
	validateSearch: historySearchSchema,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(expenseHistoryMonthsQueryOptions()),
	component: ExpenseHistoryRoute,
});

function ExpenseHistoryRoute() {
	const childMatches = useChildMatches();
	return childMatches.length > 0 ? <Outlet /> : <ExpenseHistoryPage />;
}
