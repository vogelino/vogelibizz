import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { Route } from "@/routes/_resource/expenses/dashboard";
import useExpenseDashboard from "@/utility/data/useExpenseDashboard";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import {
	type ExpenseDashboardComparison,
	type ExpenseDashboardComparisonView,
	getExpenseDashboardComparisonView,
} from "./expenseDashboardComparison";

type Category =
	ExpenseDashboard["months"][number]["categories"][number]["category"];
type TrendSelection = { month: string; category: Category | undefined };

type DashboardActions = {
	setMonth: (month: string | null) => void;
	setComparison: (comparison: ExpenseDashboardComparison) => void;
	openCurrentHistory: (category: Category) => void;
	openBaselineHistory: (category: Category) => void;
	openTrendHistory: (selection: TrendSelection) => void;
};

export type ExpenseDashboardPageState =
	| { status: "pending" }
	| { status: "error"; message: string }
	| { status: "empty" }
	| {
			status: "ready";
			dashboard: ExpenseDashboard;
			view: ExpenseDashboardComparisonView;
			comparison: ExpenseDashboardComparison;
			actions: DashboardActions;
	  };

export function useExpenseDashboardPage(): ExpenseDashboardPageState {
	const dashboardQuery = useExpenseDashboard();
	const search = Route.useSearch();
	const dashboard = dashboardQuery.data;
	const comparison = search.compare ?? "current-year";
	const view = useMemo(
		() =>
			dashboard
				? getExpenseDashboardComparisonView(dashboard, search.month, comparison)
				: null,
		[comparison, dashboard, search.month],
	);
	const navigate = useNavigate({ from: Route.fullPath });

	const setMonth = useCallback(
		(month: string | null) =>
			navigate({
				search: (previous) => ({
					...previous,
					month:
						month === dashboard?.months.at(-1)?.month
							? undefined
							: (month ?? undefined),
				}),
				replace: true,
			}),
		[dashboard?.months, navigate],
	);
	const setComparison = useCallback(
		(nextComparison: ExpenseDashboardComparison) =>
			navigate({
				search: (previous) => ({
					...previous,
					compare:
						nextComparison === "current-year" ? undefined : nextComparison,
				}),
				replace: true,
			}),
		[navigate],
	);
	const openCurrentHistory = useCallback(
		(category: Category) => {
			if (!view) return;
			navigate({
				to: "/expenses/history",
				search: {
					month: view.current.month,
					category: category ? [category] : undefined,
					uncategorizedOnly: category === null ? true : undefined,
				},
			});
		},
		[navigate, view],
	);
	const openBaselineHistory = useCallback(
		(category: Category) => {
			const firstMonth = view?.baselineMonths[0]?.month;
			const lastMonth = view?.baselineMonths.at(-1)?.month;
			if (!firstMonth || !lastMonth) return;
			navigate({
				to: "/expenses/history",
				search: {
					month: firstMonth === lastMonth ? firstMonth : undefined,
					fromMonth: firstMonth === lastMonth ? undefined : firstMonth,
					toMonth: firstMonth === lastMonth ? undefined : lastMonth,
					category: category ? [category] : undefined,
					uncategorizedOnly: category === null ? true : undefined,
				},
			});
		},
		[navigate, view],
	);
	const openTrendHistory = useCallback(
		({ month, category }: TrendSelection) =>
			navigate({
				to: "/expenses/history",
				search: {
					month,
					category: category ? [category] : undefined,
					uncategorizedOnly: category === null ? true : undefined,
				},
			}),
		[navigate],
	);
	const actions = useMemo(
		() => ({
			setMonth,
			setComparison,
			openCurrentHistory,
			openBaselineHistory,
			openTrendHistory,
		}),
		[
			openBaselineHistory,
			openCurrentHistory,
			openTrendHistory,
			setComparison,
			setMonth,
		],
	);

	if (dashboardQuery.isPending) return { status: "pending" };
	if (dashboardQuery.error) {
		return { status: "error", message: dashboardQuery.error.message };
	}
	if (!dashboard || !view) return { status: "empty" };
	return { status: "ready", dashboard, view, comparison, actions };
}
