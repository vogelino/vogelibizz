import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { Link } from "next-view-transitions";

export const dynamic = "force-dynamic";
export default function ProjectCreatePageRoute() {
	return (
		<FormPageLayout
			title="Create Project"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/projects`}>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={`project-create-form`}>
						<SaveIcon />
						{"Create project"}
					</Button>
				</>
			}
		>
			<ProjectEdit formId={`project-create-form`} />
		</FormPageLayout>
	);
}
