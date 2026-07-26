import { Search } from "lucide-react";
import { useContext } from "react";
import { cn } from "@/utility/classNames";
import { SearchContext } from "../../searchContext";

type SearchTriggerProps = {
	className?: string;
	onOpen?: () => void;
};

export function SearchTrigger({ className, onOpen }: SearchTriggerProps) {
	const context = useContext(SearchContext);
	if (!context)
		throw new Error("SearchTrigger must be used within SearchProvider");
	return (
		<button
			type="button"
			onClick={() => {
				onOpen?.();
				context.openSearch();
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
