"use client";

import { type ReactNode, useMemo } from "react";

import { GlobalSearchView } from "./components/global-search-view";
import { SearchContext } from "./searchContext";
import { useGlobalSearch } from "./useGlobalSearch";

type SearchProviderProps = {
  children: ReactNode;
};

export function SearchProvider({ children }: SearchProviderProps) {
  const search = useGlobalSearch();
  const context = useMemo(
    () => ({ openSearch: () => search.actions.setOpen(true) }),
    [search.actions],
  );

  return (
    <SearchContext.Provider value={context}>
      {children}
      <GlobalSearchView view={search.view} actions={search.actions} />
    </SearchContext.Provider>
  );
}
