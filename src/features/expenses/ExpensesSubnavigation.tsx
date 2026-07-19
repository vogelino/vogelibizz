import { Link } from "@tanstack/react-router";
import { cn } from "@/utility/classNames";

const links = [
	{ to: "/expenses", label: "Recurring expenses" },
	{ to: "/expenses/history", label: "Expenses History" },
] as const;

export function ExpensesSubnavigation({
	active,
}: {
	active: "recurring" | "history";
}) {
	return (
		<nav aria-label="Expenses sections" className="border-b border-border">
			<ul className="flex gap-6 overflow-x-auto">
				{links.map((link) => {
					const isActive =
						active === "recurring"
							? link.to === "/expenses"
							: link.to === "/expenses/history";
					return (
						<li key={link.to}>
							<Link
								to={link.to}
								search
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"inline-flex h-10 items-center whitespace-nowrap border-b-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									isActive
										? "border-foreground font-semibold text-foreground"
										: "border-transparent text-muted-foreground hover:text-foreground",
								)}
							>
								{link.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
