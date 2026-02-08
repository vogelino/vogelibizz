import { createFileRoute, Outlet } from "@tanstack/react-router";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import ExpensesPage from "@/features/expenses/ExpensesPage";

export const Route = createFileRoute("/_resource/expenses")({
	component: ExpensesLayout,
	pendingComponent: ExpensesPending,
});

function ExpensesLayout() {
	return (
		<ResourcePageLayout resource="expenses">
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
