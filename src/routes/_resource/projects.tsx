import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import ProjectList from "@/features/projects/ProjectsList";

export const Route = createFileRoute("/_resource/projects")({
	validateSearch: z.object({
		q: z.string().trim().min(1).optional().catch(undefined),
	}),
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
			<ProjectList loading />
		</ResourcePageLayout>
	);
}
