import { LoaderCircle } from "lucide-react";
import type { GlobalSearchViewModel } from "../../getGlobalSearchView";

type SearchResultsStatusProps = {
	results: GlobalSearchViewModel["results"];
};

export function SearchResultsStatus({ results }: SearchResultsStatusProps) {
	switch (results.status) {
		case "pending":
			return (
				<div className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-muted-foreground">
					<LoaderCircle className="size-5 animate-spin" />
					Indexing all records…
				</div>
			);
		case "error":
			return (
				<div className="px-6 py-10 text-center text-sm text-destructive">
					{results.message}
				</div>
			);
		case "empty":
			return (
				<div className="px-6 py-10 text-center text-sm text-muted-foreground">
					No matches. Try removing a filter or the page scope.
				</div>
			);
		case "ready":
			return null;
	}
}
