import { ListFilter } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/utility/classNames";
import { Button } from "./button";

type FilterBarProps = {
	active: boolean;
	children: ReactNode;
	className?: string;
};

export function FilterBar({ children, className }: FilterBarProps) {
	return (
		<div
			className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", className)}
		>
			{children}
		</div>
	);
}

export function useFilterControls(active: boolean) {
	const [open, setOpen] = useState<boolean | null>(null);
	useEffect(() => {
		if (active) setOpen(true);
	}, [active]);
	const visible = open ?? active;
	const toggle = useCallback(
		() => setOpen((current) => !(current ?? active)),
		[active],
	);
	const action = useMemo(
		() => (
			<Button
				variant={visible ? "default" : "ghost"}
				size="icon"
				aria-label={visible ? "Hide table controls" : "Show table controls"}
				aria-expanded={visible}
				title={visible ? "Hide table controls" : "Show table controls"}
				onClick={toggle}
			>
				<ListFilter size={20} aria-hidden="true" />
			</Button>
		),
		[toggle, visible],
	);

	return { action, visible };
}
