import type {
	SearchFilterOption,
	SearchScopeId,
	SearchToken,
} from "./searchTypes";

export type SearchRecord = Record<string, unknown>;

type ScopeSearchKeys = {
	categories: string;
	type: string;
	otherOnly: string;
};

const scopeSearchKeys: Partial<Record<SearchScopeId, ScopeSearchKeys>> = {
	expenses: {
		categories: "categories",
		type: "expenseType",
		otherOnly: "expenseOtherOnly",
	},
	"expense-history": {
		categories: "category",
		type: "type",
		otherOnly: "otherOnly",
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

	if (search[keys.otherOnly] === true) {
		tokens.push({
			id: "association:other",
			filter: "otherOnly",
			value: "true",
			label: "Association: Other only",
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
	if (option.filter === "otherOnly") next[keys.otherOnly] = true;
	return next;
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
	if (token.filter === "otherOnly") delete next[keys.otherOnly];
	return next;
}
