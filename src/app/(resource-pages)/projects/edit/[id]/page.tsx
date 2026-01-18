import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { getProject } from "@/app/api/projects/[id]/getProject";
import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import type { ProjectType } from "@/db/schema";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { parseId } from "@/utility/resourceUtil";

export const dynamic = "force-dynamic";
export default async function ProjectEditPageRoute({
	params,
}: {
	params: Promise<{ id?: string }>;
}) {
	const { id } = await params;
	if (!id) {
		return null;
	}

	const parsedId = parseId(id);
	if (!parsedId) {
		return null;
	}

	const record = await getProject(parsedId);
	const idString = `${id}`;
	const formId = `project-edit-form-${parsedId}`;
	serverQueryClient.setQueryData<ProjectType>(
		["projects", `${parsedId}`],
		record,
	);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<FormPageLayout
				id={parsedId}
				title={record?.name || "Edit project"}
				allLink="/projects"
				footerButtons={
					<>
						<Button asChild variant="outline">
							<Link href={`/projects/edit/${idString}`}>
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
				<ProjectEdit id={parsedId} formId={formId} />
			</FormPageLayout>
		</HydrationBoundary>
	);
}
