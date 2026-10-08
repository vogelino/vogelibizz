import {
	type createSearchIndex,
	filterRowsByText,
	searchDocuments,
	searchFilterOptions,
} from "./searchEngine";
import {
	filtersFromTokens,
	type SearchDocument,
	type SearchFilterOption,
	type SearchScopeId,
	type SearchToken,
	searchScopeIds,
	searchScopeLabels,
	textFromTokens,
} from "./searchTypes";

export type SearchResultGroup = {
	scope: SearchScopeId;
	documents: SearchDocument[];
};

type SearchResultsState =
	| { status: "pending"; groups: SearchResultGroup[] }
	| { status: "error"; message: string }
	| { status: "empty" }
	| { status: "ready"; groups: SearchResultGroup[] };

export type GlobalSearchViewModel = {
	open: boolean;
	scope: SearchScopeId | null;
	currentScope: SearchScopeId | null;
	tokens: SearchToken[];
	query: string;
	placeholder: string;
	canApplyTextFilter: boolean;
	matchingFilters: SearchFilterOption[];
	matchingScopes: SearchScopeId[];
	results: SearchResultsState;
};

type GetGlobalSearchViewOptions = {
	open: boolean;
	scope: SearchScopeId | null;
	currentScope: SearchScopeId | null;
	tokens: SearchToken[];
	query: string;
	index: ReturnType<typeof createSearchIndex>;
	filterOptions: SearchFilterOption[];
	loading: boolean;
	error: boolean;
};

function groupResults(
	documents: readonly SearchDocument[],
): SearchResultGroup[] {
	return searchScopeIds
		.map((scope) => ({
			scope,
			documents: documents.filter((document) => document.scope === scope),
		}))
		.filter(({ documents: scopedDocuments }) => scopedDocuments.length > 0);
}

export function getGlobalSearchView({
	open,
	scope,
	currentScope,
	tokens,
	query,
	index,
	filterOptions,
	loading,
	error,
}: GetGlobalSearchViewOptions): GlobalSearchViewModel {
	const filters = filtersFromTokens(tokens);
	const textQuery = [textFromTokens(tokens), query].filter(Boolean).join(" ");
	const results = searchDocuments(index, textQuery, scope, filters);
	const groups = groupResults(results);
	const activeIds = new Set(tokens.map((token) => token.id));
	const matchingFilters = searchFilterOptions(
		filterOptions,
		query,
		scope,
		activeIds,
	);
	const matchingScopes = query.trim()
		? filterRowsByText(
				searchScopeIds.filter((candidate) => candidate !== scope),
				query,
				(candidate) => candidate,
				(candidate) => `${searchScopeLabels[candidate]} scope page resource`,
			)
		: [];
	const hasSuggestions =
		groups.length > 0 ||
		matchingFilters.length > 0 ||
		matchingScopes.length > 0;
	const resultState: SearchResultsState = error
		? { status: "error", message: "Some records could not be indexed." }
		: loading
			? { status: "pending", groups }
			: hasSuggestions
				? { status: "ready", groups }
				: { status: "empty" };

	return {
		open,
		scope,
		currentScope,
		tokens,
		query,
		placeholder: scope
			? `Search ${searchScopeLabels[scope].toLowerCase()}…`
			: "Search everything…",
		canApplyTextFilter: Boolean(query.trim()) && scope !== null,
		matchingFilters,
		matchingScopes,
		results: resultState,
	};
}
