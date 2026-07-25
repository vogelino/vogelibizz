import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { z } from "zod";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import { ExpensesSubnavigation } from "@/features/expenses/ExpensesSubnavigation";

const expensesSearchSchema = z.object({
	q: z.string().trim().min(1).optional().catch(undefined),
	categories: z
		.array(z.enum([...expenseCategoryEnum.enumValues, "Mixed"]))
		.optional()
		.catch(undefined),
	expenseType: z
		.enum(["All types", ...expenseTypeEnum.enumValues, "Mixed"])
		.optional()
		.catch(undefined),
	expenseOtherOnly: z.boolean().optional().catch(undefined),
	uncategorizedOnly: z.boolean().optional().catch(undefined),
	duplicateId: z.coerce.number().int().positive().optional().catch(undefined),
});

export const Route = createFileRoute("/_resource/expenses")({
	validateSearch: expensesSearchSchema,
	component: ExpensesLayout,
	pendingComponent: ExpensesPending,
});

function ExpensesLayout() {
	const pathname = useLocation({
		select: (location) => location.pathname,
	});
	const active = pathname.startsWith("/expenses/dashboard")
		? "dashboard"
		: pathname.startsWith("/expenses/history")
			? "history"
			: "recurring";
	return (
		<ResourcePageLayout
			resource="expenses"
			showCreate={active === "recurring"}
			headerContent={<ExpensesSubnavigation active={active} />}
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
