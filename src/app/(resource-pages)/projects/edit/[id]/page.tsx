import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import db from "@/db";
import { projects } from "@/db/schema";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { eq } from "drizzle-orm";
import { SaveIcon } from "lucide-react";
import { Link } from "next-view-transitions";

export default function ProjectEditPageRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	serverQueryClient.prefetchQuery({
		queryKey: ["project", id],
		queryFn: () =>
			db.query.projects.findFirst({
				where: eq(projects.id, +id),
			}),
	});
	return (
		<FormPageLayout
			id={id}
			title="Edit Project"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/projects/edit/${id}`}>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={`project-edit-form-${id}`}>
						<SaveIcon />
						{"save"}
					</Button>
				</>
			}
		>
			<ProjectEdit id={id} formId={`project-edit-form-${id}`} />
		</FormPageLayout>
	);
}
