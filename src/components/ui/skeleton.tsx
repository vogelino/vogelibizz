import { cn } from "@/utility/classNames";

export function Skeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-md bg-muted/70 dark:bg-muted/40",
				className,
			)}
		/>
	);
}
