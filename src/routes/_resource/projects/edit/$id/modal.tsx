import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ProjectList from "@/features/projects/ProjectsList";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import { type ProjectType, projectSelectSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/projects/edit/$id/modal")({
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
	component: ProjectEditModal,
});

function ProjectEditModal() {
	const { id } = Route.useParams();
	const { project } = Route.useLoaderData();
	const navigate = useNavigate();
	const parsedId = parseId(id);
	if (!parsedId) return <ProjectList />;
	const formId = `project-edit-form-${parsedId}`;

	return (
		<>
			<ProjectList />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Edit project" id={parsedId} />}
				onClose={() => navigate({ to: "/projects" })}
				footer={
					<>
						<Button asChild variant="outline">
							<button
								type="button"
								onClick={() => navigate({ to: "/projects" })}
							>
								Cancel
							</button>
						</Button>
						<Button type="submit" form={formId}>
							<SaveIcon />
							{"Save"}
						</Button>
					</>
				}
			>
				<ProjectEdit id={parsedId} formId={formId} initialData={project} />
			</ResponsiveModal>
		</>
	);
}
