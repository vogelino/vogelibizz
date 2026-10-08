export const searchScopeIds = [
  "clients",
  "projects",
  "invoices",
  "expenses",
  "expense-history",
] as const;

export type SearchScopeId = (typeof searchScopeIds)[number];

export type SearchDocumentKind =
  | "client"
  | "project"
  | "invoice"
  | "expense"
  | "expense-transaction";

export type SearchDocument = {
  id: string;
  resourceId: string;
  kind: SearchDocumentKind;
  scope: SearchScopeId;
  title: string;
  subtitle: string;
  keywords: string;
  category?: string;
  type?: string;
  status?: string;
  month?: string;
};

export type SearchFilterId = "category" | "type";

export type SearchFilterToken = {
  id: string;
  filter: SearchFilterId;
  value: string;
  label: string;
};

export type SearchTextToken = {
  id: "text";
  value: string;
  label: string;
};

export type SearchToken = SearchFilterToken | SearchTextToken;

export type SearchFilters = {
  category: string[];
  type?: string;
};

export type SearchFilterOption = {
  id: string;
  filter: SearchFilterId;
  value: string;
  label: string;
  keywords: string;
  scopes: readonly SearchScopeId[];
};

export const searchScopeLabels: Record<SearchScopeId, string> = {
  clients: "Clients",
  projects: "Projects",
  invoices: "Invoices",
  expenses: "Expenses",
  "expense-history": "Expense history",
};

export const searchScopePaths: Record<SearchScopeId, string> = {
  clients: "/clients",
  projects: "/projects",
  invoices: "/invoices",
  expenses: "/expenses",
  "expense-history": "/expenses/history",
};

export function getSearchScope(pathname: string): SearchScopeId | null {
  if (pathname.startsWith("/expenses/history")) return "expense-history";
  if (pathname.startsWith("/expenses")) return "expenses";
  if (pathname.startsWith("/clients")) return "clients";
  if (pathname.startsWith("/projects")) return "projects";
  if (pathname.startsWith("/invoices")) return "invoices";
  return null;
}

export function filtersFromTokens(tokens: readonly SearchToken[]): SearchFilters {
  const filters: SearchFilters = { category: [] };
  for (const token of tokens) {
    if (!("filter" in token)) continue;
    if (token.filter === "category") filters.category.push(token.value);
    if (token.filter === "type") filters.type = token.value;
  }
  return filters;
}

export function textFromTokens(tokens: readonly SearchToken[]) {
  return tokens
    .filter((token): token is SearchTextToken => token.id === "text")
    .map((token) => token.value)
    .join(" ");
}
