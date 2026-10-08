import MiniSearch from "minisearch";

import type {
  SearchDocument,
  SearchFilterOption,
  SearchFilters,
  SearchScopeId,
} from "./searchTypes";

const searchOptions = {
  prefix: true,
  fuzzy: (term: string) => (term.length >= 4 ? 0.2 : false),
  combineWith: "AND" as const,
  boost: { title: 5, subtitle: 2, keywords: 1 },
};

export function amountSearchText(value: number, currency?: string) {
  const variants = new Set([
    String(value),
    value.toFixed(2),
    value.toLocaleString("en-GB", { maximumFractionDigits: 2 }),
    value.toLocaleString("de-CH", { maximumFractionDigits: 2 }),
    value.toLocaleString("de-DE", { maximumFractionDigits: 2 }),
  ]);
  if (currency) {
    variants.add(currency);
    for (const locale of ["en-GB", "de-CH", "de-DE"]) {
      variants.add(
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value),
      );
    }
  }
  return [...variants].join(" ");
}

export function createSearchIndex(documents: readonly SearchDocument[]) {
  const index = new MiniSearch<SearchDocument>({
    idField: "id",
    fields: ["title", "subtitle", "keywords", "resourceId"],
    storeFields: [
      "resourceId",
      "kind",
      "scope",
      "title",
      "subtitle",
      "keywords",
      "category",
      "type",
      "status",
      "month",
    ],
    searchOptions,
  });
  index.addAll([...documents]);
  return index;
}

function matchesFilters(result: Record<string, unknown>, filters: SearchFilters) {
  if (filters.category.length > 0 && !filters.category.includes(String(result.category))) {
    return false;
  }
  if (filters.type && result.type !== filters.type) return false;
  return true;
}

export function searchDocuments(
  index: MiniSearch<SearchDocument>,
  query: string,
  scope: SearchScopeId | null,
  filters: SearchFilters,
  limit = 40,
): SearchDocument[] {
  const normalizedQuery = query.trim();
  const results = index.search(normalizedQuery || MiniSearch.wildcard, {
    ...searchOptions,
    filter: (result) => (!scope || result.scope === scope) && matchesFilters(result, filters),
  });
  return results.slice(0, limit).map((result) => ({
    id: String(result.id),
    resourceId: String(result.resourceId),
    kind: result.kind as SearchDocument["kind"],
    scope: result.scope as SearchScopeId,
    title: String(result.title),
    subtitle: String(result.subtitle ?? ""),
    keywords: String(result.keywords ?? ""),
    category: typeof result.category === "string" ? result.category : undefined,
    type: typeof result.type === "string" ? result.type : undefined,
    status: typeof result.status === "string" ? result.status : undefined,
    month: typeof result.month === "string" ? result.month : undefined,
  }));
}

export function searchFilterOptions(
  options: readonly SearchFilterOption[],
  query: string,
  scope: SearchScopeId | null,
  activeIds: ReadonlySet<string>,
) {
  if (!query.trim() || !scope) return [];
  const index = new MiniSearch<SearchFilterOption>({
    idField: "id",
    fields: ["label", "keywords", "value"],
    storeFields: ["filter", "value", "label", "keywords", "scopes"],
    searchOptions: {
      prefix: true,
      fuzzy: (term) => (term.length >= 4 ? 0.2 : false),
      boost: { label: 4, value: 3, keywords: 1 },
    },
  });
  index.addAll([...options]);
  return index
    .search(query, {
      prefix: true,
      fuzzy: (term) => (term.length >= 4 ? 0.2 : false),
      filter: (result) =>
        (result.scopes as readonly SearchScopeId[]).includes(scope) &&
        !activeIds.has(String(result.id)),
    })
    .slice(0, 8)
    .map((result): SearchFilterOption => ({
      id: String(result.id),
      filter: result.filter as SearchFilterOption["filter"],
      value: String(result.value),
      label: String(result.label),
      keywords: String(result.keywords),
      scopes: result.scopes as readonly SearchScopeId[],
    }));
}

export function filterRowsByText<T>(
  rows: readonly T[],
  query: string | undefined,
  getId: (row: T) => string | number,
  getText: (row: T) => string,
) {
  const normalizedQuery = query?.trim();
  if (!normalizedQuery) return [...rows];
  const documents = rows.map((row) => ({
    id: String(getId(row)),
    text: getText(row),
  }));
  const index = new MiniSearch<(typeof documents)[number]>({
    fields: ["text"],
    storeFields: ["id"],
    searchOptions: {
      prefix: true,
      fuzzy: (term) => (term.length >= 4 ? 0.2 : false),
      combineWith: "AND",
    },
  });
  index.addAll(documents);
  const ids = new Set(
    index
      .search(normalizedQuery, {
        prefix: true,
        fuzzy: (term) => (term.length >= 4 ? 0.2 : false),
        combineWith: "AND",
      })
      .map(({ id }) => String(id)),
  );
  return rows.filter((row) => ids.has(String(getId(row))));
}
