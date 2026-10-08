import { Skeleton } from "@/components/ui/skeleton";

const metricSkeletons = ["spent", "budget", "variance", "outlook", "review"];

export function DashboardSkeleton() {
  return (
    <div className="space-y-10 px-6 py-6 md:px-10">
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-5">
        {metricSkeletons.map((key) => (
          <Skeleton key={key} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
