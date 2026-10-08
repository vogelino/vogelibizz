import type {
	SearchFilterOption,
	SearchScopeId,
	SearchToken,
} from "./searchTypes";

export type SearchRecord = Record<string, unknown>;

type ScopeSearchKeys = {
	categories: string;
	type: string;
};

const scopeSearchKeys: Partial<Record<SearchScopeId, ScopeSearchKeys>> = {
	expenses: {
		categories: "categories",
		type: "expenseType",
	},
	"expense-history": {
		categories: "category",
		type: "type",
	},
};

export function getSearchTokens(
	scope: SearchScopeId | null,
	search: SearchRecord,
): SearchToken[] {
	const tokens: SearchToken[] = [];
	if (typeof search.q === "string" && search.q.trim()) {
		tokens.push({ id: "text", value: search.q, label: `Text: ${search.q}` });
	}

	if (!scope) return tokens;
	const keys = scopeSearchKeys[scope];
	if (!keys) return tokens;

	const categories = search[keys.categories];
	for (const category of Array.isArray(categories) ? categories : []) {
		if (typeof category === "string") {
			tokens.push({
				id: `category:${category}`,
				filter: "category",
				value: category,
				label: `Category: ${category}`,
			});
		}
	}

	const type = search[keys.type];
	if (typeof type === "string" && type !== "All types") {
		tokens.push({
			id: `type:${type}`,
			filter: "type",
			value: type,
			label: `Type: ${type}`,
		});
	}

	return tokens;
}

export function addSearchFilter(
	search: SearchRecord,
	scope: SearchScopeId | null,
	option: SearchFilterOption,
): SearchRecord {
	if (!scope) return search;
	const keys = scopeSearchKeys[scope];
	if (!keys) return search;

	const next = { ...search };
	if (option.filter === "category") {
		const categories = search[keys.categories];
		next[keys.categories] = [
			...(Array.isArray(categories) ? categories : []),
			option.value,
		];
	}
	if (option.filter === "type") next[keys.type] = option.value;
	return next;
}

export function createSearchRecord(
	scope: SearchScopeId,
	tokens: readonly SearchToken[],
): SearchRecord {
	let search: SearchRecord = {};
	for (const token of tokens) {
		if ("filter" in token) {
			search = addSearchFilter(search, scope, {
				...token,
				keywords: "",
				scopes: [scope],
			});
		} else {
			search.q = token.value;
		}
	}
	return search;
}

export function removeSearchToken(
	search: SearchRecord,
	scope: SearchScopeId | null,
	token: SearchToken,
): SearchRecord {
	const next = { ...search };
	if (token.id === "text") {
		delete next.q;
		return next;
	}

	if (!scope || !("filter" in token)) return next;
	const keys = scopeSearchKeys[scope];
	if (!keys) return next;

	if (token.filter === "category") {
		const categories = search[keys.categories];
		const remaining = (Array.isArray(categories) ? categories : []).filter(
			(value) => value !== token.value,
		);
		if (remaining.length > 0) next[keys.categories] = remaining;
		else delete next[keys.categories];
	}
	if (token.filter === "type") delete next[keys.type];
	return next;
}
