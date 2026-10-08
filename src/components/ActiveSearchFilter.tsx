import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ActiveSearchFilterProps = {
	query?: string;
	onClear: () => void;
};

export function ActiveSearchFilter({
	query,
	onClear,
}: ActiveSearchFilterProps) {
	if (!query) return null;

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			onClick={onClear}
			aria-label={`Clear text search: ${query}`}
			title="Clear text search"
			className="h-9 max-w-full gap-1.5 px-3"
		>
			<span className="max-w-64 truncate">Search: “{query}”</span>
			<X className="size-4 shrink-0" aria-hidden="true" />
		</Button>
	);
}
