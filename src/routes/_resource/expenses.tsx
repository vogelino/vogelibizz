import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { z } from "zod";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import { ExpensesSubnavigation } from "@/features/expenses/ExpensesSubnavigation";

const expensesSearchSchema = z.object({
	categories: z
		.array(z.enum([...expenseCategoryEnum.enumValues, "Mixed"]))
		.optional()
		.catch(undefined),
	expenseType: z
		.enum(["All types", ...expenseTypeEnum.enumValues, "Mixed"])
		.optional()
		.catch(undefined),
	expenseOtherOnly: z.boolean().optional().catch(undefined),
});

export const Route = createFileRoute("/_resource/expenses")({
	validateSearch: expensesSearchSchema,
	component: ExpensesLayout,
	pendingComponent: ExpensesPending,
});

function ExpensesLayout() {
	const isHistory = useLocation({
		select: (location) => location.pathname.startsWith("/expenses/history"),
	});
	return (
		<ResourcePageLayout
			resource="expenses"
			showCreate={!isHistory}
			headerContent={
				<ExpensesSubnavigation active={isHistory ? "history" : "recurring"} />
			}
		>
			<Outlet />
		</ResourcePageLayout>
	);
}

function ExpensesPending() {
	return (
		<ResourcePageLayout resource="expenses">
			<ExpensesPage loading />
		</ResourcePageLayout>
	);
}
