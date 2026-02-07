import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import ResourcePageLayout from "@/components/ResourcePageLayout";

export const Route = createFileRoute("/_resource/clients")({
	component: ClientsLayout,
	pendingComponent: ClientsPending,
});

function ClientsLayout() {
	return (
		<ResourcePageLayout resource="clients">
			<Outlet />
		</ResourcePageLayout>
	);
}

function ClientsPending() {
	return (
		<ResourcePageLayout resource="clients">
			<div className="flex flex-col gap-4">
				<Skeleton className="h-9 w-1/3" />
				<Skeleton className="h-9 w-full" />
				<Skeleton className="h-9 w-full" />
			</div>
		</ResourcePageLayout>
	);
}
