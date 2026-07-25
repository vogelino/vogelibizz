"use client";

import { useLocation, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	LoaderCircle,
	Search,
	SlidersHorizontal,
	X,
} from "lucide-react";
import {
	createContext,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import { cn } from "@/utility/classNames";
import useClients from "@/utility/data/useClients";
import useExpenseHistoryMonth from "@/utility/data/useExpenseHistoryMonth";
import useExpenses from "@/utility/data/useExpenses";
import useInvoices from "@/utility/data/useInvoices";
import useProjects from "@/utility/data/useProjects";
import { resourceIconMap } from "@/utility/resourceIcons";
import {
	createSearchDocuments,
	createSearchFilterOptions,
} from "./searchDocuments";
import {
	createSearchIndex,
	filterRowsByText,
	searchDocuments,
	searchFilterOptions,
} from "./searchEngine";
import {
	filtersFromTokens,
	getSearchScope,
	type SearchDocument,
	type SearchFilterOption,
	type SearchFilterToken,
	type SearchScopeId,
	type SearchTextToken,
	type SearchToken,
	searchScopeIds,
	searchScopeLabels,
	textFromTokens,
} from "./searchTypes";

type SearchContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

type SearchRecord = Record<string, unknown>;

function getUrlTokens(
	scope: SearchScopeId | null,
	search: SearchRecord,
): SearchToken[] {
	const tokens: SearchToken[] = [];
	if (typeof search.q === "string" && search.q.trim()) {
		tokens.push({ id: "text", value: search.q, label: `Text: ${search.q}` });
	}
	if (scope === "expenses") {
		for (const category of Array.isArray(search.categories)
			? search.categories
			: []) {
			if (typeof category === "string") {
				tokens.push({
					id: `category:${category}`,
					filter: "category",
					value: category,
					label: `Category: ${category}`,
				});
			}
		}
		if (
			typeof search.expenseType === "string" &&
			search.expenseType !== "All types"
		) {
			tokens.push({
				id: `type:${search.expenseType}`,
				filter: "type",
				value: search.expenseType,
				label: `Type: ${search.expenseType}`,
			});
		}
		if (search.expenseOtherOnly === true) {
			tokens.push({
				id: "association:other",
				filter: "otherOnly",
				value: "true",
				label: "Association: Other only",
			});
		}
	}
	if (scope === "expense-history") {
		for (const category of Array.isArray(search.category)
			? search.category
			: []) {
			if (typeof category === "string") {
				tokens.push({
					id: `category:${category}`,
					filter: "category",
					value: category,
					label: `Category: ${category}`,
				});
			}
		}
		if (typeof search.type === "string" && search.type !== "All types") {
			tokens.push({
				id: `type:${search.type}`,
				filter: "type",
				value: search.type,
				label: `Type: ${search.type}`,
			});
		}
		if (search.otherOnly === true) {
			tokens.push({
				id: "association:other",
				filter: "otherOnly",
				value: "true",
				label: "Association: Other only",
			});
		}
	}
	return tokens;
}

function groupResults(documents: readonly SearchDocument[]) {
	return searchScopeIds
		.map((scope) => ({
			scope,
			documents: documents.filter((document) => document.scope === scope),
		}))
		.filter(({ documents: scopedDocuments }) => scopedDocuments.length > 0);
}

export function SearchProvider({ children }: { children: ReactNode }) {
	const location = useLocation();
	const navigate = useNavigate();
	const pathname = location.pathname;
	const locationSearch = location.search as SearchRecord;
	const currentScope = getSearchScope(pathname);
	const [open, setOpenState] = useState(false);
	const [scope, setScope] = useState<SearchScopeId | null>(currentScope);
	const [tokens, setTokens] = useState<SearchToken[]>(() =>
		getUrlTokens(currentScope, locationSearch),
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
			if (nextOpen) {
				const nextScope = getSearchScope(pathname);
				setScope(nextScope);
				setTokens(getUrlTokens(nextScope, locationSearch));
				setQuery("");
			}
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
	const filters = useMemo(() => filtersFromTokens(tokens), [tokens]);
	const textQuery = [textFromTokens(tokens), query].filter(Boolean).join(" ");
	const results = useMemo(
		() => searchDocuments(index, textQuery, scope, filters),
		[filters, index, scope, textQuery],
	);
	const groupedResults = useMemo(() => groupResults(results), [results]);
	const filterOptions = useMemo(
		() =>
			createSearchFilterOptions(
				[...expenseCategoryEnum.enumValues, "Mixed"],
				[...expenseTypeEnum.enumValues, "Mixed"],
			),
		[],
	);
	const activeIds = useMemo(
		() => new Set(tokens.map((token) => token.id)),
		[tokens],
	);
	const matchingFilters = useMemo(
		() => searchFilterOptions(filterOptions, query, scope, activeIds),
		[activeIds, filterOptions, query, scope],
	);
	const matchingScopes = useMemo(
		() =>
			query.trim()
				? filterRowsByText(
						searchScopeIds.filter((candidate) => candidate !== scope),
						query,
						(candidate) => candidate,
						(candidate) =>
							`${searchScopeLabels[candidate]} scope page resource`,
					)
				: [],
		[query, scope],
	);
	const loading =
		clientsQuery.isPending ||
		projectsQuery.isPending ||
		invoicesQuery.isPending ||
		expensesQuery.isPending ||
		historyQuery.isPending ||
		historyQuery.isFetchingNextPage;

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
					option.filter === "type" || option.filter === "otherOnly"
						? previous.filter(
								(item) => !("filter" in item) || item.filter !== option.filter,
							)
						: previous;
				return [...withoutSameSingleValue, token];
			});
			setQuery("");
			if (scope !== currentScope) return;
			updateUrl((previous) => {
				const next = { ...previous };
				if (scope === "expenses") {
					if (option.filter === "category") {
						next.categories = [
							...(Array.isArray(previous.categories)
								? previous.categories
								: []),
							option.value,
						];
					}
					if (option.filter === "type") next.expenseType = option.value;
					if (option.filter === "otherOnly") next.expenseOtherOnly = true;
				}
				if (scope === "expense-history") {
					if (option.filter === "category") {
						next.category = [
							...(Array.isArray(previous.category) ? previous.category : []),
							option.value,
						];
					}
					if (option.filter === "type") next.type = option.value;
					if (option.filter === "otherOnly") next.otherOnly = true;
				}
				return next;
			});
		},
		[currentScope, scope, updateUrl],
	);

	const removeToken = useCallback(
		(token: SearchToken) => {
			setTokens((previous) => previous.filter((item) => item.id !== token.id));
			if (scope !== currentScope) return;
			updateUrl((previous) => {
				const next = { ...previous };
				if (token.id === "text") delete next.q;
				if (!("filter" in token)) return next;
				if (scope === "expenses") {
					if (token.filter === "category") {
						next.categories = (
							Array.isArray(previous.categories) ? previous.categories : []
						).filter((value) => value !== token.value);
					}
					if (token.filter === "type") delete next.expenseType;
					if (token.filter === "otherOnly") delete next.expenseOtherOnly;
				}
				if (scope === "expense-history") {
					if (token.filter === "category") {
						next.category = (
							Array.isArray(previous.category) ? previous.category : []
						).filter((value) => value !== token.value);
					}
					if (token.filter === "type") delete next.type;
					if (token.filter === "otherOnly") delete next.otherOnly;
				}
				return next;
			});
		},
		[currentScope, scope, updateUrl],
	);

	const applyTextFilter = useCallback(() => {
		const value = query.trim();
		if (!value || scope !== currentScope) return;
		const token: SearchTextToken = {
			id: "text",
			value,
			label: `Text: ${value}`,
		};
		setTokens((previous) => [
			...previous.filter((item) => item.id !== "text"),
			token,
		]);
		setQuery("");
		updateUrl((previous) => ({ ...previous, q: value }));
	}, [currentScope, query, scope, updateUrl]);

	const navigateToDocument = useCallback(
		(document: SearchDocument) => {
			setOpen(false);
			const id = document.resourceId;
			switch (document.kind) {
				case "client":
					return navigate({ to: "/clients/edit/$id", params: { id } });
				case "project":
					return navigate({ to: "/projects/edit/$id", params: { id } });
				case "invoice":
					return navigate({ to: "/invoices/$id", params: { id } });
				case "expense":
					return navigate({
						to: "/expenses/edit/$id",
						params: { id },
						search: {},
					});
				case "expense-transaction":
					return navigate({
						to: "/expenses/history/edit/$id",
						params: { id },
						search: document.month ? { month: document.month } : {},
					});
				case "expense-overview":
					return navigate({
						to: "/expenses",
						search: { expenseOtherOnly: true },
					});
			}
		},
		[navigate, setOpen],
	);

	const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Backspace" || query.length > 0) return;
		const lastToken = tokens.at(-1);
		if (lastToken) {
			event.preventDefault();
			removeToken(lastToken);
			return;
		}
		if (scope) {
			event.preventDefault();
			setScope(null);
		}
	};

	return (
		<SearchContext.Provider value={{ open, setOpen }}>
			{children}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					animation="rise"
					className="max-w-2xl overflow-hidden p-0 max-sm:inset-0 max-sm:h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:border-0"
					aria-describedby={undefined}
				>
					<Command shouldFilter={false} loop label="Search Vogelibizz">
						<CommandInput
							autoFocus
							value={query}
							onValueChange={setQuery}
							onKeyDown={onInputKeyDown}
							placeholder={
								scope
									? `Search ${searchScopeLabels[scope].toLowerCase()}…`
									: "Search everything…"
							}
							prefix={
								<div className="flex shrink-0 items-center gap-1">
									{scope ? (
										<SearchChip
											label={searchScopeLabels[scope]}
											onRemove={() => setScope(null)}
										/>
									) : null}
									{tokens.map((token) => (
										<SearchChip
											key={token.id}
											label={token.label}
											onRemove={() => removeToken(token)}
										/>
									))}
								</div>
							}
						/>
						<CommandList className="max-h-[min(65vh,32rem)] max-sm:max-h-none max-sm:flex-1">
							{query.trim() && scope === currentScope ? (
								<CommandGroup heading="Actions">
									<CommandItem
										value={`apply:${query}`}
										onSelect={applyTextFilter}
									>
										<SlidersHorizontal className="text-muted-foreground" />
										<span>Filter this table for “{query.trim()}”</span>
										<CommandShortcut>Enter</CommandShortcut>
									</CommandItem>
								</CommandGroup>
							) : null}
							{matchingFilters.length > 0 || matchingScopes.length > 0 ? (
								<CommandGroup heading="Add a filter or scope">
									{matchingFilters.map((option) => (
										<CommandItem
											key={option.id}
											value={`filter:${option.id}`}
											onSelect={() => addFilter(option)}
										>
											<SlidersHorizontal className="text-muted-foreground" />
											<span>{option.label}</span>
											<CommandShortcut>Add filter</CommandShortcut>
										</CommandItem>
									))}
									{matchingScopes.map((nextScope) => {
										const Icon = resourceIconMap[nextScope];
										return (
											<CommandItem
												key={nextScope}
												value={`scope:${nextScope}`}
												onSelect={() => {
													setScope(nextScope);
													setQuery("");
												}}
											>
												<Icon className="size-5 text-muted-foreground" />
												<span>Search in {searchScopeLabels[nextScope]}</span>
												<CommandShortcut>Set scope</CommandShortcut>
											</CommandItem>
										);
									})}
								</CommandGroup>
							) : null}
							{groupedResults.map(({ scope: resultScope, documents }) => {
								const Icon = resourceIconMap[resultScope];
								return (
									<CommandGroup
										key={resultScope}
										heading={searchScopeLabels[resultScope]}
									>
										{documents.map((document) => (
											<CommandItem
												key={document.id}
												value={document.id}
												onSelect={() => navigateToDocument(document)}
											>
												<Icon className="size-5 shrink-0 text-muted-foreground" />
												<span className="min-w-0 grow">
													<span className="block truncate">
														{document.title}
													</span>
													{document.subtitle ? (
														<span className="block truncate text-xs text-muted-foreground">
															{document.subtitle}
														</span>
													) : null}
												</span>
												<ArrowRight className="shrink-0 text-muted-foreground" />
											</CommandItem>
										))}
									</CommandGroup>
								);
							})}
							{loading ? (
								<div className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-muted-foreground">
									<LoaderCircle className="size-5 animate-spin" />
									Indexing all records…
								</div>
							) : null}
							{!loading &&
							groupedResults.length === 0 &&
							matchingFilters.length === 0 &&
							matchingScopes.length === 0 ? (
								<div className="px-6 py-10 text-center text-sm text-muted-foreground">
									No matches. Try removing a filter or the page scope.
								</div>
							) : null}
						</CommandList>
						<div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
							<span>↑↓ Navigate · ↵ Open · ⌫ Remove filter</span>
							<span>Esc Close</span>
						</div>
					</Command>
				</DialogContent>
			</Dialog>
		</SearchContext.Provider>
	);
}

function SearchChip({
	label,
	onRemove,
}: {
	label: string;
	onRemove: () => void;
}) {
	return (
		<span className="inline-flex h-7 max-w-48 items-center gap-1 rounded-sm bg-secondary px-2 text-xs text-secondary-foreground">
			<span className="truncate">{label}</span>
			<button
				type="button"
				className="rounded-sm opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label={`Remove ${label}`}
				onClick={(event) => {
					event.stopPropagation();
					onRemove();
				}}
			>
				<X className="size-3" />
			</button>
		</span>
	);
}

export function SearchTrigger({
	className,
	onOpen,
}: {
	className?: string;
	onOpen?: () => void;
}) {
	const context = useContext(SearchContext);
	if (!context)
		throw new Error("SearchTrigger must be used within SearchProvider");
	return (
		<button
			type="button"
			onClick={() => {
				onOpen?.();
				context.setOpen(true);
			}}
			className={cn(
				"inline-flex h-9 items-center gap-2 border border-border bg-background px-2.5 text-sm text-muted-foreground",
				"hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				className,
			)}
			aria-label="Search"
		>
			<Search className="size-5" />
			<span className="hidden lg:inline">Search</span>
			<kbd className="hidden border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] lg:inline">
				⌘ K
			</kbd>
		</button>
	);
}
