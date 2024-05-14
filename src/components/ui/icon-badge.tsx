import { cn } from "@/utility/classNames";
import type { ReactNode } from "react";
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
				"w-fit pt-0.5 text-fg border-grayLight flex gap-1.5",
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
