import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";
import ResourcePageLayout from "@/components/ResourcePageLayout";
import { projectStatusEnum } from "@/db/schema";
import ProjectList from "@/features/projects/ProjectsList";

export const Route = createFileRoute("/_resource/projects")({
	validateSearch: z.object({
		q: z.string().trim().min(1).optional().catch(undefined),
		statuses: z
			.array(z.enum(projectStatusEnum.enumValues))
			.optional()
			.catch(undefined),
		clientIds: z.array(z.string().regex(/^\d+$/)).optional().catch(undefined),
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
