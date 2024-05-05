"use client";
import { IconBadge } from "@/components/ui/icon-badge";
import useProject from "@/utility/data/useProject";
import { mapStatusToIcon, mapStatusToLabel } from "@/utility/statusUtil";
import Markdown from "marked-react";

function ProjectDisplay({ id }: { id: string }) {
	const { data, isPending } = useProject(+id);

	if (isPending) return <div>Loading...</div>;
	if (!data) return <div>No project found</div>;

	const { description, content, status } = data;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col">
				<h5 className="text-grayDark">{"Description"}</h5>
				<p>{description}</p>
			</div>
			<div className="flex flex-col">
				<h5 className="text-grayDark">{"Status"}</h5>
				<IconBadge
					icon={mapStatusToIcon(status)}
					label={mapStatusToLabel(status)}
				/>
			</div>
			<div className="flex flex-col">
				<h5 className="text-grayDark">{"Content"}</h5>
				<Markdown>{content || ""}</Markdown>
			</div>
		</div>
	);
}

export default ProjectDisplay;
