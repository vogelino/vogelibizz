"use client";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import { SaveIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import { usePathname, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";
export default function ProjectCreateModalRoute() {
	const router = useRouter();
	const pathname = usePathname();
	return (
		<ResponsiveModal
			open={pathname === `/projects/create`}
			title={<PageHeaderTitle name="Create project" />}
			onClose={() => router.push("/projects")}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/projects`}>Cancel</Link>
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
