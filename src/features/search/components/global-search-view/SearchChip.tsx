import { X } from "lucide-react";

type SearchChipProps = {
	label: string;
	onRemove: () => void;
};

export function SearchChip({ label, onRemove }: SearchChipProps) {
	return (
		<span className="inline-flex h-7 max-w-48 items-center gap-1 rounded-sm bg-secondary px-2 text-xs text-secondary-foreground">
			<span className="truncate">{label}</span>
			<button
				type="button"
				className="rounded-sm opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label={`Remove ${label}`}
				onClick={(event) => {
					event.stopPropagation();
					onRemove();
				}}
			>
				<X className="size-3" />
			</button>
		</span>
	);
}
