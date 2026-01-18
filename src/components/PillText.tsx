import type { PropsWithChildren } from "react";
import { cn } from "@/utility/classNames";

export function PillText({
	children,
	pillColorClass,
}: PropsWithChildren<{ pillColorClass: string }>) {
	return (
		<>
			<span
				className={cn(`size-3 items-center inline-block`, pillColorClass)}
			/>
			<span>{children}</span>
		</>
	);
}
