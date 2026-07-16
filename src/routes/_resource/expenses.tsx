import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import { ExpensesSubnavigation } from "@/features/expenses/ExpensesSubnavigation";

export const Route = createFileRoute("/_resource/expenses")({
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
			headerContent={<ExpensesSubnavigation />}
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
