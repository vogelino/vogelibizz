"use client";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";

export const dynamic = "force-dynamic";
export default function ProjectCreateModalRoute() {
	const navigate = useNavigate();
	const pathname = useLocation().pathname;
	return (
		<ResponsiveModal
			open={pathname === `/projects/create`}
			title={<PageHeaderTitle name="Create project" />}
			onClose={() => navigate({ to: "/projects" })}
			footer={
				<>
					<Button asChild variant="outline">
						<Link to={`/projects`}>Cancel</Link>
					</Button>
					<Button type="submit" form={`project-create-form`}>
						<SaveIcon />
						{"Create project"}
					</Button>
				</>
			}
		>
			<ProjectEdit formId={`project-create-form`} />
		</ResponsiveModal>
	);
}
