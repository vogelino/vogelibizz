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
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (active) setOpen(false);
	}, [active]);

	const visible = active || open;
	const toggle = useCallback(() => setOpen((current) => !current), []);
	const action = useMemo(
		() =>
			active ? null : (
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
		[active, toggle, visible],
	);

	return { action, visible };
}
