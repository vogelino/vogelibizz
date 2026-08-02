"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type SelectionActionBarProps = {
	selectedCount: number;
	disabled?: boolean;
	onClear: () => void;
	onEdit?: () => void;
	onDelete: () => void;
};

export function SelectionActionBar({
	selectedCount,
	disabled = false,
	onClear,
	onEdit,
	onDelete,
}: SelectionActionBarProps) {
	useEffect(() => {
		if (selectedCount === 0) return;
		const clearOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClear();
		};
		window.addEventListener("keydown", clearOnEscape);
		return () => window.removeEventListener("keydown", clearOnEscape);
	}, [onClear, selectedCount]);

	if (selectedCount === 0) return null;

	return (
		<div
			className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 animate-in items-center gap-2 border border-border bg-popover p-2 text-popover-foreground shadow-2xl fade-in slide-in-from-bottom-3 duration-200 motion-reduce:animate-none sm:w-auto sm:min-w-md"
			role="toolbar"
			aria-label={`Actions for ${selectedCount} selected ${selectedCount === 1 ? "item" : "items"}`}
		>
			<div className="flex min-w-0 flex-1 items-center gap-2 px-1">
				<Checkbox
					checked
					onCheckedChange={onClear}
					aria-label="Clear selection"
				/>
				<span className="truncate text-sm font-medium" aria-live="polite">
					{selectedCount} selected
				</span>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				{onEdit && (
					<>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							disabled={disabled}
							onClick={onEdit}
							aria-label={`Edit ${selectedCount} selected ${selectedCount === 1 ? "item" : "items"}`}
						>
							<PencilIcon className="size-4" aria-hidden="true" />
							<span className="hidden sm:inline">Edit</span>
						</Button>
						<div className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
					</>
				)}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="text-destructive hover:bg-destructive/10 hover:text-destructive"
					disabled={disabled}
					onClick={onDelete}
					aria-label={`Delete ${selectedCount} selected ${selectedCount === 1 ? "item" : "items"}`}
				>
					<Trash2Icon className="size-4" aria-hidden="true" />
					<span className="hidden sm:inline">Delete</span>
				</Button>
			</div>
		</div>
	);
}
