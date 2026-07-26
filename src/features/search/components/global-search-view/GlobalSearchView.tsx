import { Command } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { GlobalSearchViewModel } from "../../getGlobalSearchView";
import type { GlobalSearchActions } from "../../useGlobalSearch";
import { SearchCommandList } from "./SearchCommandList";
import { SearchInput } from "./SearchInput";

type GlobalSearchViewProps = {
	view: GlobalSearchViewModel;
	actions: GlobalSearchActions;
};

export function GlobalSearchView({ view, actions }: GlobalSearchViewProps) {
	return (
		<Dialog open={view.open} onOpenChange={actions.setOpen}>
			<DialogContent
				animation="rise"
				className="max-w-2xl overflow-hidden p-0 max-sm:inset-0 max-sm:h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:border-0"
				aria-describedby={undefined}
			>
				<Command shouldFilter={false} loop label="Search Vogelibizz">
					<SearchInput view={view} actions={actions} />
					<SearchCommandList view={view} actions={actions} />
					<div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
						<span>↑↓ Navigate · ↵ Open · ⌫ Remove filter</span>
						<span>Esc Close</span>
					</div>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
