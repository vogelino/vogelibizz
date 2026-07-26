import type { LucideIcon } from "lucide-react";

type DashboardMetricProps = {
	label: string;
	value: string;
	detail: string;
	icon: LucideIcon;
};

export function DashboardMetric({
	label,
	value,
	detail,
	icon: Icon,
}: DashboardMetricProps) {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<p className="flex items-center gap-2 text-sm text-muted-foreground">
				<Icon className="size-4" aria-hidden="true" />
				{label}
			</p>
			<p className="mt-1 text-2xl font-semibold leading-6 tabular-nums">
				{value}
			</p>
			<p className="text-sm text-muted-foreground">{detail}</p>
		</div>
	);
}
