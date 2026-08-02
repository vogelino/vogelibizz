"use client";

import { BarChart, LineChart } from "echarts/charts";
import {
	GridComponent,
	LegendComponent,
	TooltipComponent,
} from "echarts/components";
import type { EChartsCoreOption, EChartsType } from "echarts/core";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useMemo, useRef } from "react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import {
	getExpenseCategoryColor,
	getExpenseCategoryLabel,
	otherCategoriesLabel,
	uncategorizedLabel,
} from "../../expenseDashboardPresentation";
import { chartTextStyle, chartTooltipStyle } from "../chartTooltipStyle";
import type { MonthlySpendingTrendProps } from "./recentContextTypes";

echarts.use([
	BarChart,
	LineChart,
	GridComponent,
	LegendComponent,
	TooltipComponent,
	SVGRenderer,
]);

export function MonthlySpendingTrend({
	data,
	onSelect,
	referenceLabel = "Typical month",
}: MonthlySpendingTrendProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<EChartsType | null>(null);
	const onSelectRef = useRef(onSelect);
	onSelectRef.current = onSelect;

	const option = useMemo<EChartsCoreOption>(() => {
		const visibleMonths = data.months;
		const totalsByCategory = new Map<string, number>();
		for (const month of visibleMonths) {
			for (const category of month.categories) {
				const label = getExpenseCategoryLabel(category.category);
				totalsByCategory.set(
					label,
					(totalsByCategory.get(label) ?? 0) + category.total,
				);
			}
		}
		const topLabels: string[] = [...totalsByCategory.entries()]
			.filter(([label]) => label !== uncategorizedLabel)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6)
			.map(([label]) => label);
		if (totalsByCategory.has(uncategorizedLabel)) {
			topLabels.push(uncategorizedLabel);
		}
		const hasOther = [...totalsByCategory.keys()].some(
			(label) => !topLabels.includes(label),
		);
		const categoryByLabel = new Map<
			string,
			ExpenseDashboard["months"][number]["categories"][number]["category"]
		>(
			visibleMonths.flatMap((month) =>
				month.categories.map(
					(item) =>
						[getExpenseCategoryLabel(item.category), item.category] as const,
				),
			),
		);
		const seriesLabels = hasOther
			? [...topLabels, otherCategoriesLabel]
			: topLabels;

		const categorySeries = seriesLabels.map((label) => ({
			name: label,
			type: "bar" as const,
			stack: "spending",
			barMaxWidth: 42,
			itemStyle: {
				color:
					label === otherCategoriesLabel
						? "#d0d5dd"
						: getExpenseCategoryColor(categoryByLabel.get(label) ?? null),
			},
			emphasis: { focus: "series" as const },
			data: visibleMonths.map((month) => {
				if (label === otherCategoriesLabel) {
					return month.categories
						.filter(
							(item) =>
								!topLabels.includes(getExpenseCategoryLabel(item.category)),
						)
						.reduce((total, item) => total + item.total, 0);
				}
				return (
					month.categories.find(
						(item) => getExpenseCategoryLabel(item.category) === label,
					)?.total ?? 0
				);
			}),
		}));

		return {
			animationDuration: 350,
			grid: {
				left: 16,
				right: 16,
				top: 48,
				bottom: 30,
				show: true,
				backgroundColor: "var(--chart-plot-background)",
				borderWidth: 0,
				containLabel: true,
			},
			legend: {
				type: "scroll",
				top: 0,
				left: 0,
				icon: "circle",
				itemWidth: 9,
				itemHeight: 9,
				textStyle: chartTextStyle,
			},
			tooltip: {
				...chartTooltipStyle,
				trigger: "axis",
				axisPointer: { type: "shadow" },
				valueFormatter: (value: unknown) =>
					formatCurrency(Number(value ?? 0), data.currency),
			},
			xAxis: {
				type: "category",
				data: visibleMonths.map(({ month }) => month),
				axisLine: { lineStyle: { color: "#98a2b3" } },
				axisTick: { show: false },
				axisLabel: {
					...chartTextStyle,
					formatter: (value: string) => {
						const [year, month] = value.split("-");
						return `${month}/${year.slice(2)}`;
					},
				},
			},
			yAxis: {
				type: "value",
				splitLine: {
					lineStyle: { color: "var(--color-border)" },
				},
				axisLabel: {
					...chartTextStyle,
					align: "left",
					margin: 32,
					width: 24,
					formatter: (value: number) =>
						new Intl.NumberFormat("en-GB", {
							notation: "compact",
							maximumFractionDigits: 1,
						}).format(value),
				},
			},
			series: [
				...categorySeries,
				{
					name: referenceLabel,
					type: "line",
					symbol: "none",
					itemStyle: { color: "#98a2b3" },
					lineStyle: { color: "#98a2b3", width: 2 },
					tooltip: { show: false },
					data: visibleMonths.map(() => data.typicalMonthlyTotal ?? 0),
				},
			],
		};
	}, [data, referenceLabel]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const chart = echarts.init(container, undefined, { renderer: "svg" });
		chartRef.current = chart;
		chart.setOption(option);
		chart.on("click", (event) => {
			if (
				event.componentType !== "series" ||
				event.seriesType !== "bar" ||
				typeof event.name !== "string"
			) {
				return;
			}
			const seriesName = String(event.seriesName);
			const category =
				seriesName === otherCategoriesLabel
					? undefined
					: data.months
							.flatMap((month) => month.categories)
							.find(
								(item) => getExpenseCategoryLabel(item.category) === seriesName,
							)?.category;
			onSelectRef.current({
				month: event.name,
				category,
			});
		});
		const resizeObserver = new ResizeObserver(() => chart.resize());
		resizeObserver.observe(container);
		return () => {
			resizeObserver.disconnect();
			chart.dispose();
			chartRef.current = null;
		};
	}, [data, option]);

	return (
		<div
			ref={containerRef}
			className="h-80 w-full"
			role="img"
			aria-label="Monthly spending stacked by category. Select a bar segment to view its transactions."
		/>
	);
}
