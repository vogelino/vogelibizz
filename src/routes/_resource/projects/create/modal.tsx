import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ProjectList from "@/features/projects/ProjectsList";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";

export const Route = createFileRoute("/_resource/projects/create/modal")({
	component: ProjectCreateModal,
});

function ProjectCreateModal() {
	const navigate = useNavigate();
	const formId = "project-create-form";

	return (
		<>
			<ProjectList />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Create project" />}
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
							{"Create project"}
						</Button>
					</>
				}
			>
				<ProjectEdit formId={formId} />
			</ResponsiveModal>
		</>
	);
}
