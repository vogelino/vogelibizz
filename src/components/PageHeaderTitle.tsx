import { Badge } from "@/components/ui/badge";
import { cn } from "@/utility/classNames";

function PageHeaderTitle({
	name = "Edit expense",
	id,
}: {
	name?: string;
	id?: string | number;
}) {
	return (
		<div
			className={cn(
				"antialiased uppercase",
				"grid grid-cols-[1fr_auto] gap-4 items-center max-w-full",
			)}
		>
			<div className="truncate">
				<span>{name}</span>
			</div>
			{id && (
				<Badge variant="outline" className="font-mono mt-1">
					{id}
				</Badge>
			)}
		</div>
	);
}

export default PageHeaderTitle;
