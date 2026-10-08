import { SlidersHorizontal } from "lucide-react";
import {
	CommandGroup,
	CommandItem,
	CommandShortcut,
} from "@/components/ui/command";
import { type SearchScopeId, searchScopeLabels } from "../../searchTypes";

type SearchTextFilterActionProps = {
	query: string;
	scope: SearchScopeId | null;
	enabled: boolean;
	onApply: () => void;
};

export function SearchTextFilterAction({
	query,
	scope,
	enabled,
	onApply,
}: SearchTextFilterActionProps) {
	if (!enabled || !scope) return null;
	return (
		<CommandGroup heading="Actions">
			<CommandItem value={`apply:${query}`} onSelect={onApply}>
				<SlidersHorizontal className="text-muted-foreground" />
				<span>
					Filter {searchScopeLabels[scope].toLowerCase()} for “{query.trim()}”
				</span>
				<CommandShortcut>Enter</CommandShortcut>
			</CommandItem>
		</CommandGroup>
	);
}
