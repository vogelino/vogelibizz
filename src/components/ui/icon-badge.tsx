import type { ReactNode } from "react";
import { cn } from "@/utility/classNames";
import { Badge, type BadgeProps } from "./badge";

export function IconBadge({
	icon,
	badgeProps = {},
	label,
	className,
}: {
	icon: ReactNode;
	badgeProps?: BadgeProps;
	label?: ReactNode;
	className?: string;
}) {
	return (
		<Badge
			variant="outline"
			{...badgeProps}
			className={cn(
				"w-fit pt-0.5 text-foreground border-border flex gap-1.5",
				" max-w-40",
				icon && `pl-1.5`,
				badgeProps.className,
				className,
			)}
		>
			{icon}
			{label && <span className="mt-0.5 max-w-full truncate">{label}</span>}
		</Badge>
	);
}
