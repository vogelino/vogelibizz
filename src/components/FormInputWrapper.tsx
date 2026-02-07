import type { PropsWithChildren, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FormInputWrapper({
	label,
	children,
	error,
	loading = false,
	loadingChildren,
}: PropsWithChildren<{
	label: ReactNode;
	error?: string;
	loading?: boolean;
	loadingChildren?: ReactNode;
}>) {
	if (loading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-4 w-32" />
				{loadingChildren ?? <Skeleton className="h-9 w-full" />}
			</div>
		);
	}
	return (
		<div className="flex flex-col gap-2">
			<span className="text-muted-foreground">{label}</span>
			{children}
			{error && <span style={{ color: "red" }}>{error}</span>}
		</div>
	);
}

export default FormInputWrapper;
