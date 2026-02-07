import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { type ProjectType, projectSelectSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/projects/edit/$id")({
	loader: async ({ params }) => {
		const parsedId = parseId(params.id);
		if (typeof window === "undefined") {
			const { getProject } = await import("@/server/api/projects/getProject");
			const project = await getProject(parsedId);
			return { project };
		}
		const project = await createQueryFunction<ProjectType>({
			resourceName: "projects",
			action: "querySingle",
			outputZodSchema: projectSelectSchema,
			id: parsedId,
		})();
		return { project };
	},
	component: ProjectEditPageRoute,
	pendingComponent: ProjectEditPagePending,
	pendingMs: 0,
	pendingMinMs: 200,
});

function ProjectEditPageRoute() {
	const { id } = Route.useParams();
	const { project } = Route.useLoaderData();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const formId = `project-edit-form-${parsedId}`;
	const isPending = useRouterState({ select: (state) => state.isLoading });

	return (
		<FormPageLayout
			id={parsedId}
			title="Edit project"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/projects">
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={formId}>
						<SaveIcon />
						{"Save"}
					</Button>
				</>
			}
		>
			<ProjectEdit
				id={parsedId}
				formId={formId}
				initialData={project}
				loading={isPending}
			/>
		</FormPageLayout>
	);
}

function ProjectEditPagePending() {
	const { id } = Route.useParams();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const formId = `project-edit-form-${parsedId}`;
	return (
		<FormPageLayout
			id={parsedId}
			title="Edit project"
			allLink="/projects"
			footerButtons={null}
		>
			<ProjectEdit id={parsedId} formId={formId} loading />
		</FormPageLayout>
	);
}
