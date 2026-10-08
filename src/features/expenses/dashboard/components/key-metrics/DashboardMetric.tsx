import type { LucideIcon } from "lucide-react";

import { cn } from "@/utility/classNames";

type DashboardMetricProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
  size?: "compact" | "default" | "large";
};

export function DashboardMetric({
  label,
  value,
  detail,
  icon: Icon,
  iconClassName,
  className,
  size = "default",
}: DashboardMetricProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <p className="flex items-center gap-2 text-sm text-muted-foreground text-balance">
        <Icon className={cn("size-4", iconClassName)} aria-hidden="true" />
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums",
          size === "large" && "text-3xl leading-8",
          size === "default" && "text-2xl leading-6",
          size === "compact" && "text-xl leading-6",
        )}
      >
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
