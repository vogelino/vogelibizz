import { CommandList } from "@/components/ui/command";
import type { GlobalSearchViewModel } from "../../getGlobalSearchView";
import type { GlobalSearchActions } from "../../useGlobalSearch";
import { SearchFilterSuggestions } from "./SearchFilterSuggestions";
import { SearchResultGroups } from "./SearchResultGroups";
import { SearchResultsStatus } from "./SearchResultsStatus";
import { SearchTextFilterAction } from "./SearchTextFilterAction";

type SearchCommandListProps = {
	view: GlobalSearchViewModel;
	actions: GlobalSearchActions;
};

export function SearchCommandList({ view, actions }: SearchCommandListProps) {
	return (
		<CommandList className="max-h-[min(65vh,32rem)] max-sm:max-h-none max-sm:flex-1">
			<SearchTextFilterAction
				query={view.query}
				enabled={view.canApplyTextFilter}
				onApply={actions.applyTextFilter}
			/>
			<SearchFilterSuggestions
				filters={view.matchingFilters}
				scopes={view.matchingScopes}
				onAddFilter={actions.addFilter}
				onSelectScope={actions.setScope}
			/>
			<SearchResultGroups
				results={view.results}
				onOpenDocument={actions.openDocument}
			/>
			<SearchResultsStatus results={view.results} />
		</CommandList>
	);
}
