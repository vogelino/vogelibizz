import { SlidersHorizontal } from "lucide-react";
import {
	CommandGroup,
	CommandItem,
	CommandShortcut,
} from "@/components/ui/command";

type SearchTextFilterActionProps = {
	query: string;
	enabled: boolean;
	onApply: () => void;
};

export function SearchTextFilterAction({
	query,
	enabled,
	onApply,
}: SearchTextFilterActionProps) {
	if (!enabled) return null;
	return (
		<CommandGroup heading="Actions">
			<CommandItem value={`apply:${query}`} onSelect={onApply}>
				<SlidersHorizontal className="text-muted-foreground" />
				<span>Filter this table for “{query.trim()}”</span>
				<CommandShortcut>Enter</CommandShortcut>
			</CommandItem>
		</CommandGroup>
	);
}
