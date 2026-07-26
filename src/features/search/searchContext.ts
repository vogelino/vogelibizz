import { createContext } from "react";

export type SearchContextValue = {
	openSearch: () => void;
};

export const SearchContext = createContext<SearchContextValue | null>(null);
