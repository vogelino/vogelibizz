import { Link } from "@tanstack/react-router";
import { ChevronDown, History, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utility/classNames";

const expenseSections = [
	{
		to: "/expenses" as const,
		label: "Recurring",
		description: "Manage planned, repeating expenses",
		icon: RefreshCw,
	},
	{
		to: "/expenses/history" as const,
		label: "History",
		description: "Review imported monthly transactions",
		icon: History,
	},
];

export function ExpensesMenuItem({
	currentPage,
	onNavigate,
}: {
	currentPage: string;
	onNavigate: () => void;
}) {
	const expensesActive = currentPage === "expenses";
	const historyActive = currentPage.startsWith("expenses/history");
	const [mobileExpanded, setMobileExpanded] = useState(
		expensesActive || historyActive,
	);

	return (
		<li className="group relative inline-block w-full md:w-auto">
			{/* On larger screens, this follows shadcn's hover/focus navigation-menu pattern. */}
			<div className="hidden md:block">
				<Link
					to="/expenses"
					aria-label="Header menu link: Expenses page"
					className={cn(
						"inline-flex items-center gap-1 px-4 py-1.5 text-base font-normal outline-none transition-colors",
						"focus-visible:ring-2 focus-visible:ring-ring",
						"group-hover:bg-accent group-focus-within:bg-accent",
						(expensesActive || historyActive) && "bg-secondary font-semibold",
					)}
				>
					Expenses
					<ChevronDown
						aria-hidden="true"
						className="size-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
					/>
				</Link>

				<div
					className={cn(
						"invisible absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-2 opacity-0",
						"transition duration-150 motion-reduce:transition-none",
						"group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
					)}
				>
					<ul
						aria-label="Expense sections"
						className="grid gap-1 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
					>
						{expenseSections.map((section) => {
							const Icon = section.icon;
							const active =
								section.to === "/expenses" ? expensesActive : historyActive;
							return (
								<li key={section.to}>
									<Link
										to={section.to}
										className={cn(
											"flex gap-3 rounded-sm p-3 outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
											"focus-visible:bg-accent focus-visible:text-accent-foreground",
											active && "bg-accent text-accent-foreground",
										)}
									>
										<Icon
											aria-hidden="true"
											className="mt-0.5 size-4 shrink-0 text-muted-foreground"
										/>
										<span>
											<span className="block text-sm font-medium leading-none">
												{section.label}
											</span>
											<span className="mt-1.5 block text-xs leading-snug text-muted-foreground">
												{section.description}
											</span>
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			</div>

			{/* The mobile menu uses a disclosure so it does not depend on hover. */}
			<div className="md:hidden">
				<button
					type="button"
					aria-expanded={mobileExpanded}
					aria-controls="mobile-expense-sections"
					onClick={() => setMobileExpanded((expanded) => !expanded)}
					className={cn(
						"flex h-12 w-full items-center justify-between border-b border-border px-6 text-base uppercase antialiased outline-none transition-colors",
						"focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
						expensesActive || historyActive
							? "bg-secondary font-semibold"
							: "hover:bg-accent",
					)}
				>
					Expenses
					<ChevronDown
						aria-hidden="true"
						className={cn(
							"size-4 transition-transform duration-200",
							mobileExpanded && "rotate-180",
						)}
					/>
				</button>
				<ul
					id="mobile-expense-sections"
					aria-label="Expense sections"
					hidden={!mobileExpanded}
					className="border-b border-border bg-muted/40 py-1"
				>
					{expenseSections.map((section) => {
						const Icon = section.icon;
						const active =
							section.to === "/expenses" ? expensesActive : historyActive;
						return (
							<li key={section.to}>
								<Link
									to={section.to}
									onClick={onNavigate}
									aria-current={active ? "page" : undefined}
									className={cn(
										"flex min-h-12 items-center gap-3 px-10 py-2 text-sm outline-none transition-colors",
										"hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
										active && "bg-accent font-medium",
									)}
								>
									<Icon
										aria-hidden="true"
										className="size-4 text-muted-foreground"
									/>
									{section.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</li>
	);
}
