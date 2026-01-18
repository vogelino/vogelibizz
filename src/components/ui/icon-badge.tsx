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
				"w-fit py-1 text-foreground border-border flex gap-1.5",
				" max-w-40",
				icon && `pl-1.5`,
				badgeProps.className,
				className,
			)}
		>
			{icon}
			{label && (
				<span className="max-w-full h-fit truncate [text-box-trim:trim-both]">
					{label}
				</span>
			)}
		</Badge>
	);
}
