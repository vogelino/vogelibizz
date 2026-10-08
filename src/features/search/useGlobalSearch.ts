import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import useClients from "@/utility/data/useClients";
import useExpenseHistoryMonth from "@/utility/data/useExpenseHistoryMonth";
import useExpenses from "@/utility/data/useExpenses";
import useInvoices from "@/utility/data/useInvoices";
import useProjects from "@/utility/data/useProjects";
import {
	type GlobalSearchViewModel,
	getGlobalSearchView,
} from "./getGlobalSearchView";
import {
	createSearchDocuments,
	createSearchFilterOptions,
} from "./searchDocuments";
import { createSearchIndex } from "./searchEngine";
import {
	getSearchScope,
	type SearchDocument,
	type SearchFilterOption,
	type SearchFilterToken,
	type SearchScopeId,
	type SearchTextToken,
	type SearchToken,
	searchScopePaths,
} from "./searchTypes";
import {
	addSearchFilter,
	createSearchRecord,
	getSearchTokens,
	removeSearchToken,
	type SearchRecord,
} from "./searchUrlState";

export type GlobalSearchActions = {
	setOpen: (open: boolean) => void;
	setQuery: (query: string) => void;
	setScope: (scope: SearchScopeId | null) => void;
	addFilter: (option: SearchFilterOption) => void;
	removeToken: (token: SearchToken) => void;
	removeLastConstraint: () => void;
	applyTextFilter: () => void;
	openDocument: (document: SearchDocument) => void;
};

export type GlobalSearchState = {
	view: GlobalSearchViewModel;
	actions: GlobalSearchActions;
};

const filterOptions = createSearchFilterOptions(
	[...expenseCategoryEnum.enumValues, "Mixed"],
	[...expenseTypeEnum.enumValues, "Mixed"],
);

export function useGlobalSearch(): GlobalSearchState {
	const location = useLocation();
	const navigate = useNavigate();
	const pathname = location.pathname;
	const locationSearch = location.search as SearchRecord;
	const currentScope = getSearchScope(pathname);
	const [open, setOpenState] = useState(false);
	const [scope, setScopeState] = useState<SearchScopeId | null>(currentScope);
	const [tokens, setTokens] = useState<SearchToken[]>(() =>
		getSearchTokens(currentScope, locationSearch),
	);
	const [query, setQuery] = useState("");

	const clientsQuery = useClients({ enabled: open });
	const projectsQuery = useProjects({ enabled: open });
	const invoicesQuery = useInvoices({ enabled: open });
	const expensesQuery = useExpenses({ enabled: open });
	const historyQuery = useExpenseHistoryMonth(open ? null : undefined);

	useEffect(() => {
		if (!open || !historyQuery.hasNextPage || historyQuery.isFetchingNextPage)
			return;
		void historyQuery.fetchNextPage();
	}, [
		historyQuery.fetchNextPage,
		historyQuery.hasNextPage,
		historyQuery.isFetchingNextPage,
		open,
	]);

	const setOpen = useCallback(
		(nextOpen: boolean) => {
			setOpenState(nextOpen);
			if (!nextOpen) return;
			const nextScope = getSearchScope(pathname);
			setScopeState(nextScope);
			setTokens(getSearchTokens(nextScope, locationSearch));
			setQuery("");
		},
		[locationSearch, pathname],
	);

	useEffect(() => {
		const onKeyDown = (event: globalThis.KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setOpen(!open);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, setOpen]);

	const transactions = useMemo(
		() => historyQuery.data?.pages.flatMap((page) => page.transactions) ?? [],
		[historyQuery.data],
	);
	const documents = useMemo(
		() =>
			createSearchDocuments({
				clients: clientsQuery.data ?? [],
				projects: projectsQuery.data ?? [],
				invoices: invoicesQuery.data ?? [],
				expenses: expensesQuery.data ?? [],
				transactions,
			}),
		[
			clientsQuery.data,
			expensesQuery.data,
			invoicesQuery.data,
			projectsQuery.data,
			transactions,
		],
	);
	const index = useMemo(() => createSearchIndex(documents), [documents]);
	const loading =
		clientsQuery.isPending ||
		projectsQuery.isPending ||
		invoicesQuery.isPending ||
		expensesQuery.isPending ||
		historyQuery.isPending ||
		historyQuery.isFetchingNextPage;
	const error =
		clientsQuery.isError ||
		projectsQuery.isError ||
		invoicesQuery.isError ||
		expensesQuery.isError ||
		historyQuery.isError;
	const view = useMemo(
		() =>
			getGlobalSearchView({
				open,
				scope,
				currentScope,
				tokens,
				query,
				index,
				filterOptions,
				loading,
				error,
			}),
		[currentScope, error, index, loading, open, query, scope, tokens],
	);

	const updateUrl = useCallback(
		(updater: (previous: SearchRecord) => SearchRecord) => {
			void navigate({
				to: pathname as never,
				search: updater as never,
				replace: true,
			});
		},
		[navigate, pathname],
	);

	const addFilter = useCallback(
		(option: SearchFilterOption) => {
			const token: SearchFilterToken = {
				id: option.id,
				filter: option.filter,
				value: option.value,
				label: option.label,
			};
			setTokens((previous) => {
				const withoutSameSingleValue =
					option.filter === "type"
						? previous.filter(
								(item) => !("filter" in item) || item.filter !== option.filter,
							)
						: previous;
				return [...withoutSameSingleValue, token];
			});
			setQuery("");
			if (scope === currentScope) {
				updateUrl((previous) => addSearchFilter(previous, scope, option));
			}
		},
		[currentScope, scope, updateUrl],
	);

	const removeToken = useCallback(
		(token: SearchToken) => {
			setTokens((previous) => previous.filter((item) => item.id !== token.id));
			if (scope === currentScope) {
				updateUrl((previous) => removeSearchToken(previous, scope, token));
			}
		},
		[currentScope, scope, updateUrl],
	);

	const setScope = useCallback((nextScope: SearchScopeId | null) => {
		setScopeState(nextScope);
		setQuery("");
	}, []);

	const removeLastConstraint = useCallback(() => {
		const lastToken = tokens.at(-1);
		if (lastToken) {
			removeToken(lastToken);
			return;
		}
		if (scope) setScopeState(null);
	}, [removeToken, scope, tokens]);

	const applyTextFilter = useCallback(() => {
		const value = query.trim();
		if (!value || !scope) return;
		const token: SearchTextToken = {
			id: "text",
			value,
			label: `Text: ${value}`,
		};
		const nextTokens = [...tokens.filter((item) => item.id !== "text"), token];
		setTokens(nextTokens);
		setQuery("");
		if (scope === currentScope) {
			updateUrl((previous) => ({ ...previous, q: value }));
			return;
		}
		setOpen(false);
		void navigate({
			to: searchScopePaths[scope] as never,
			search: createSearchRecord(scope, nextTokens) as never,
		});
	}, [currentScope, navigate, query, scope, setOpen, tokens, updateUrl]);

	const openDocument = useCallback(
		(document: SearchDocument) => {
			setOpen(false);
			const id = document.resourceId;
			switch (document.kind) {
				case "client":
					void navigate({ to: "/clients/edit/$id", params: { id } });
					break;
				case "project":
					void navigate({ to: "/projects/edit/$id", params: { id } });
					break;
				case "invoice":
					void navigate({ to: "/invoices/$id", params: { id } });
					break;
				case "expense":
					void navigate({
						to: "/expenses/edit/$id",
						params: { id },
						search: {},
					});
					break;
				case "expense-transaction":
					void navigate({
						to: "/expenses/history/edit/$id",
						params: { id },
						search: document.month ? { month: document.month } : {},
					});
					break;
			}
		},
		[navigate, setOpen],
	);

	const actions = useMemo(
		() => ({
			setOpen,
			setQuery,
			setScope,
			addFilter,
			removeToken,
			removeLastConstraint,
			applyTextFilter,
			openDocument,
		}),
		[
			addFilter,
			applyTextFilter,
			openDocument,
			removeLastConstraint,
			removeToken,
			setOpen,
			setScope,
		],
	);

	return { view, actions };
}
