import { Link } from "@tanstack/react-router";
import { cn } from "@/utility/classNames";
import { type ResourceIconKey, resourceIconMap } from "@/utility/resourceIcons";

const links: readonly {
	to: "/expenses" | "/expenses/dashboard" | "/expenses/history";
	label: string;
	icon: ResourceIconKey;
}[] = [
	{
		to: "/expenses/dashboard",
		label: "Dashboard",
		icon: "expense-dashboard",
	},
	{ to: "/expenses", label: "Recurring expenses", icon: "expenses" },
	{
		to: "/expenses/history",
		label: "Expense history",
		icon: "expense-history",
	},
] as const;

export function ExpensesSubnavigation({
	active,
}: {
	active: "dashboard" | "recurring" | "history";
}) {
	return (
		<nav
			aria-label="Expenses sections"
			className="sticky left-0 top-16 z-30 border-b border-border bg-background px-6 md:px-10"
		>
			<ul className="flex gap-6 overflow-x-auto">
				{links.map((link) => {
					const Icon = resourceIconMap[link.icon];
					const isActive =
						(active === "dashboard" && link.to === "/expenses/dashboard") ||
						(active === "recurring" && link.to === "/expenses") ||
						(active === "history" && link.to === "/expenses/history");
					return (
						<li key={link.to}>
							<Link
								to={link.to}
								search
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"inline-flex h-10 items-center whitespace-nowrap border-b-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									isActive
										? "border-foreground text-foreground"
										: "border-transparent text-muted-foreground hover:text-foreground",
								)}
							>
								<Icon
									className="mr-2 size-5 text-muted-foreground"
									aria-hidden="true"
								/>
								{link.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
