import { getProject } from "@/app/api/projects/[id]/getProject";
import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import type { ProjectType } from "@/db/schema";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { parseId } from "@/utility/resourceUtil";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export default async function ProjectEditPageRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const record = await getProject(parseId(id));
	serverQueryClient.setQueryData<ProjectType>(["projects", `${id}`], record);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<FormPageLayout
				id={id}
				title={record?.name || "Edit project"}
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
							{"Save"}
						</Button>
					</>
				}
			>
				<ProjectEdit id={id} formId={`project-edit-form-${id}`} />
			</FormPageLayout>
		</HydrationBoundary>
	);
}
