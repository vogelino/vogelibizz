import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import ResourcePageLayout from "@/components/ResourcePageLayout";

export const Route = createFileRoute("/_resource/projects")({
	component: ProjectsLayout,
	pendingComponent: ProjectsPending,
});

function ProjectsLayout() {
	return (
		<ResourcePageLayout resource="projects">
			<Outlet />
		</ResourcePageLayout>
	);
}

function ProjectsPending() {
	return (
		<ResourcePageLayout resource="projects">
			<div className="flex flex-col gap-4">
				<Skeleton className="h-9 w-1/3" />
				<Skeleton className="h-9 w-full" />
				<Skeleton className="h-9 w-full" />
			</div>
		</ResourcePageLayout>
	);
}
