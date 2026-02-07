import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import ResourcePageLayout from "@/components/ResourcePageLayout";

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
			<div className="flex flex-col gap-4">
				<Skeleton className="h-9 w-1/3" />
				<Skeleton className="h-9 w-full" />
				<Skeleton className="h-9 w-full" />
			</div>
		</ResourcePageLayout>
	);
}
