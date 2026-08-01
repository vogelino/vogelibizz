"use client";

import { useMediaQuery } from "@custom-react-hooks/use-media-query";
import { BarChart } from "echarts/charts";
import {
	DatasetComponent,
	GridComponent,
	MarkLineComponent,
	TooltipComponent,
	VisualMapComponent,
} from "echarts/components";
import type { EChartsCoreOption, EChartsType } from "echarts/core";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useMemo, useRef } from "react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency, locale } from "@/utility/formatUtil";
import type { ExpenseDashboardCategoryComparison } from "../../expenseDashboardComparison";
import { getExpenseCategoryLabel } from "../../expenseDashboardPresentation";
import { formatSignedCurrency } from "../formatSignedCurrency";

echarts.use([
	BarChart,
	DatasetComponent,
	GridComponent,
	MarkLineComponent,
	TooltipComponent,
	VisualMapComponent,
	SVGRenderer,
]);

type DashboardCategory =
	ExpenseDashboard["months"][number]["categories"][number]["category"];

type SpendingChangeChartProps = {
	movers: ExpenseDashboardCategoryComparison[];
	currency: ExpenseDashboard["currency"];
	currentTitle: string;
	baselineLabel: string;
	onSelect: (category: DashboardCategory) => void;
};

type MoverDatum = {
	categoryLabel: string;
	difference: number;
	currentTotal: number;
	baselineTotal: number;
};

function getMoverDatum(value: unknown): MoverDatum | null {
	if (!value || typeof value !== "object") return null;
	const datum = value as Partial<MoverDatum>;
	if (
		typeof datum.categoryLabel !== "string" ||
		typeof datum.difference !== "number" ||
		typeof datum.currentTotal !== "number" ||
		typeof datum.baselineTotal !== "number"
	) {
		return null;
	}
	return datum as MoverDatum;
}

function formatCompactSignedCurrency(value: number, currency: string) {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		notation: "compact",
		maximumFractionDigits: 1,
		signDisplay: "always",
	}).format(value);
}

export function SpendingChangeChart({
	movers,
	currency,
	currentTitle,
	baselineLabel,
	onSelect,
}: SpendingChangeChartProps) {
	const showValueLabels = useMediaQuery("(min-width: 640px)");
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<EChartsType | null>(null);
	const onSelectRef = useRef(onSelect);
	onSelectRef.current = onSelect;

	const option = useMemo<EChartsCoreOption>(() => {
		const source = movers.map((item) => ({
			categoryLabel: getExpenseCategoryLabel(item.category),
			difference: item.difference,
			currentTotal: item.currentTotal,
			baselineTotal: item.baselineTotal,
		}));
		const largestMagnitude = Math.max(
			1,
			...source.map(({ difference }) => Math.abs(difference)),
		);
		const axisExtent = largestMagnitude * 1.28;

		return {
			animationDuration: 350,
			dataset: {
				dimensions: [
					"categoryLabel",
					"difference",
					"currentTotal",
					"baselineTotal",
				],
				source,
			},
			grid: {
				left: 8,
				right: 12,
				top: 8,
				bottom: 28,
				containLabel: true,
			},
			tooltip: {
				trigger: "item",
				formatter: (parameters: { data?: unknown }) => {
					const datum = getMoverDatum(parameters.data);
					if (!datum) return "";
					return [
						`<strong>${datum.categoryLabel}</strong>`,
						`${currentTitle}: ${formatCurrency(datum.currentTotal, currency)}`,
						`${baselineLabel}: ${formatCurrency(datum.baselineTotal, currency)}`,
						`Change: ${formatSignedCurrency(datum.difference, currency)}`,
					].join("<br/>");
				},
			},
			visualMap: {
				show: false,
				dimension: "difference",
				pieces: [
					{ lt: 0, color: "#059669" },
					{ gt: 0, color: "#d97706" },
				],
			},
			xAxis: {
				type: "value",
				min: -axisExtent,
				max: axisExtent,
				axisLine: { show: false },
				axisTick: { show: false },
				splitNumber: 4,
				splitLine: {
					lineStyle: {
						color: "rgba(152, 162, 179, 0.2)",
						type: "dashed",
					},
				},
				axisLabel: {
					color: "#98a2b3",
					fontSize: 11,
					formatter: (value: number) =>
						new Intl.NumberFormat(locale, {
							notation: "compact",
							maximumFractionDigits: 1,
						}).format(value),
				},
			},
			yAxis: {
				type: "category",
				inverse: true,
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: {
					color: "#667085",
					fontSize: 12,
					width: 104,
					overflow: "truncate",
				},
			},
			series: [
				{
					type: "bar",
					encode: {
						x: "difference",
						y: "categoryLabel",
						itemName: "categoryLabel",
						tooltip: ["currentTotal", "baselineTotal", "difference"],
					},
					cursor: "pointer",
					barMaxWidth: 28,
					label: {
						show: showValueLabels,
						position: "outside",
						color: "#667085",
						fontSize: 11,
						formatter: (parameters: { data?: unknown }) => {
							const datum = getMoverDatum(parameters.data);
							return datum
								? formatCompactSignedCurrency(datum.difference, currency)
								: "";
						},
					},
					markLine: {
						silent: true,
						symbol: "none",
						label: { show: false },
						lineStyle: {
							color: "#98a2b3",
							width: 1,
							type: "solid",
						},
						data: [{ xAxis: 0 }],
					},
				},
			],
		};
	}, [baselineLabel, currency, currentTitle, movers, showValueLabels]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const chart = echarts.init(container, undefined, { renderer: "svg" });
		chartRef.current = chart;
		chart.setOption(option);
		chart.on("click", (event) => {
			const datum = getMoverDatum(event.data);
			if (!datum) return;
			const mover = movers.find(
				(item) =>
					getExpenseCategoryLabel(item.category) === datum.categoryLabel,
			);
			if (mover) onSelectRef.current(mover.category);
		});
		const resizeObserver = new ResizeObserver(() => chart.resize());
		resizeObserver.observe(container);
		return () => {
			resizeObserver.disconnect();
			chart.dispose();
			chartRef.current = null;
		};
	}, [movers, option]);

	return (
		<div
			ref={containerRef}
			className="h-80 w-full"
			role="img"
			aria-label={`Category spending changes compared with ${baselineLabel}. Decreases extend left and increases extend right. Select a bar to view transactions.`}
		/>
	);
}
