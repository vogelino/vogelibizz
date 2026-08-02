"use client";

import { useMediaQuery } from "@custom-react-hooks/use-media-query";
import type { CustomSeriesRenderItem } from "echarts";
import { CustomChart, ScatterChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import type { EChartsCoreOption, EChartsType } from "echarts/core";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useMemo, useRef } from "react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency, locale } from "@/utility/formatUtil";
import type { ExpenseDashboardCategoryComparison } from "../../expenseDashboardComparison";
import {
	getExpenseCategoryColor,
	getExpenseCategoryLabel,
} from "../../expenseDashboardPresentation";
import {
	chartTextSmFontSize,
	chartTextStyle,
	chartTooltipStyle,
} from "../chartTooltipStyle";
import { formatSignedCurrency } from "../formatSignedCurrency";

echarts.use([
	CustomChart,
	ScatterChart,
	GridComponent,
	TooltipComponent,
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
	value: [number, number];
};

const categoryLegendDotSize = 10;
const categoryLegendGap = 8;

const tooltipIcons = {
	current:
		'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>',
	past: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
} as const;

function getDifferenceTooltipIcon(difference: number) {
	const path =
		difference > 0
			? '<path d="M12 19V5M5 12l7-7 7 7"/>'
			: '<path d="M12 5v14M19 12l-7 7-7-7"/>';
	return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${getChangeColor(difference, 1)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function escapeTooltipHtml(value: string) {
	return value.replace(
		/[&<>"']/g,
		(character) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[character] ?? character,
	);
}

function formatTooltipRow(icon: string, label: string, amount: string) {
	return [
		'<span style="display:flex;align-items:center">',
		icon,
		"</span>",
		`<span>${escapeTooltipHtml(label)}</span>`,
		`<strong style="text-align:left;font-variant-numeric:tabular-nums">${escapeTooltipHtml(amount)}</strong>`,
	].join("");
}

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

function formatSpendingFactor(currentTotal: number, baselineTotal: number) {
	if (baselineTotal === 0) return currentTotal > 0 ? "new" : "1x";
	return `${new Intl.NumberFormat(locale, {
		maximumFractionDigits: 2,
	}).format(currentTotal / baselineTotal)}x`;
}

function getChangeColor(difference: number, strength: number) {
	const direction =
		difference > 0
			? { lightness: 0.577, chroma: 0.245, hue: 27.325 }
			: { lightness: 0.527, chroma: 0.154, hue: 150.069 };
	return `oklch(${direction.lightness} ${direction.chroma} ${direction.hue} / ${strength})`;
}

function getConnectorGradient(
	difference: number,
	transparentColor: string,
	changeColor: string,
) {
	const colorStops =
		difference > 0
			? [
					{ offset: 0, color: transparentColor },
					{ offset: 1, color: changeColor },
				]
			: [
					{ offset: 0, color: changeColor },
					{ offset: 1, color: transparentColor },
				];
	return {
		type: "linear" as const,
		x: 0,
		y: 0,
		x2: 1,
		y2: 0,
		colorStops,
		global: false,
	};
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
		const largestDifference = Math.max(
			...movers.map(({ difference }) => Math.abs(difference)),
		);
		const source = movers.map((item, index) => {
			const changeStrength = Math.abs(item.difference) / largestDifference;
			const changeColor = getChangeColor(item.difference, changeStrength);
			const transparentColor = getChangeColor(item.difference, 0);
			return {
				categoryLabel: getExpenseCategoryLabel(item.category),
				categoryColor: getExpenseCategoryColor(item.category),
				difference: item.difference,
				currentTotal: item.currentTotal,
				baselineTotal: item.baselineTotal,
				changeColor,
				connectorColor: getConnectorGradient(
					item.difference,
					transparentColor,
					changeColor,
				),
				value: [item.currentTotal, index] as [number, number],
			};
		});
		const largestTotal = Math.max(
			1,
			...source.flatMap(({ currentTotal, baselineTotal }) => [
				currentTotal,
				baselineTotal,
			]),
		);
		const baselineColor = "oklch(0.707 0.022 261.325)";
		const renderConnector: CustomSeriesRenderItem = (parameters, api) => {
			const datum = source[parameters.dataIndex];
			const baselinePoint = api.coord([
				datum.baselineTotal,
				parameters.dataIndex,
			]);
			const currentPoint = api.coord([
				datum.currentTotal,
				parameters.dataIndex,
			]);
			return {
				type: "rect",
				name: datum.categoryLabel,
				tooltipDisabled: false,
				silent: false,
				shape: {
					x: Math.min(baselinePoint[0], currentPoint[0]),
					y: baselinePoint[1] - 7,
					width: Math.abs(currentPoint[0] - baselinePoint[0]),
					height: 14,
					r: 7,
				},
				style: { fill: datum.connectorColor },
			};
		};

		return {
			animationDuration: 350,
			grid: {
				left: 8,
				right: showValueLabels ? 96 : 8,
				top: 8,
				bottom: 28,
				show: true,
				backgroundColor: "var(--chart-plot-background)",
				borderWidth: 0,
				containLabel: true,
			},
			tooltip: {
				...chartTooltipStyle,
				trigger: "item",
				formatter: (parameters: { data?: unknown }) => {
					const datum = getMoverDatum(parameters.data);
					if (!datum) return "";
					const factor = formatSpendingFactor(
						datum.currentTotal,
						datum.baselineTotal,
					);
					const currentAmount = `${formatCurrency(datum.currentTotal, currency)} · ${factor}`;
					const pastAmount = formatCurrency(datum.baselineTotal, currency);
					const difference = formatSignedCurrency(datum.difference, currency);
					return [
						'<div style="display:grid;grid-template-columns:16px max-content max-content;align-items:center;column-gap:8px;row-gap:6px;text-align:left">',
						`<strong style="grid-column:1 / -1;margin-bottom:2px">${escapeTooltipHtml(datum.categoryLabel)}</strong>`,
						formatTooltipRow(tooltipIcons.current, currentTitle, currentAmount),
						formatTooltipRow(tooltipIcons.past, baselineLabel, pastAmount),
						formatTooltipRow(
							getDifferenceTooltipIcon(datum.difference),
							"Difference",
							difference,
						),
						"</div>",
					].join("");
				},
			},
			xAxis: {
				type: "value",
				min: 0,
				max: largestTotal * 1.08,
				axisLine: { show: false },
				axisTick: { show: false },
				splitNumber: 4,
				splitLine: {
					lineStyle: {
						color: "var(--color-border)",
					},
				},
				axisLabel: {
					...chartTextStyle,
					formatter: (value: number) =>
						new Intl.NumberFormat(locale, {
							notation: "compact",
							maximumFractionDigits: 1,
						}).format(value),
				},
			},
			yAxis: [
				{
					type: "category",
					inverse: true,
					data: source.map(({ categoryLabel }) => categoryLabel),
					axisLine: { show: false },
					axisTick: { show: false },
					axisLabel: {
						...chartTextStyle,
						align: "left",
						margin: 132,
						width: 124,
						overflow: "truncate",
						formatter: (value: string, index: number) =>
							`{categoryDot${index}| }{categoryGap| }${value}`,
						rich: {
							categoryGap: { width: categoryLegendGap },
							...Object.fromEntries(
								source.map(({ categoryColor }, index) => [
									`categoryDot${index}`,
									{
										width: categoryLegendDotSize,
										height: categoryLegendDotSize,
										borderRadius: categoryLegendDotSize / 2,
										backgroundColor: categoryColor,
									},
								]),
							),
						},
					},
				},
				{
					type: "category",
					position: "right",
					inverse: true,
					data: source.map(({ currentTotal, baselineTotal }) =>
						formatSpendingFactor(currentTotal, baselineTotal),
					),
					axisLine: { show: false },
					axisTick: { show: false },
					axisLabel: {
						...chartTextStyle,
						align: "left",
						color: "var(--color-muted-foreground)",
						margin: 12,
						width: 56,
					},
				},
			],
			series: [
				{
					name: "Spending change",
					type: "custom",
					coordinateSystem: "cartesian2d",
					dimensions: ["pastAmount", "categoryIndex", "currentAmount"],
					encode: {
						x: ["pastAmount", "currentAmount"],
						y: "categoryIndex",
						tooltip: ["pastAmount", "currentAmount"],
					},
					data: source.map((datum, index) => ({
						...datum,
						value: [datum.baselineTotal, index, datum.currentTotal],
					})),
					renderItem: renderConnector,
					cursor: "pointer",
					z: 1,
				},
				{
					name: baselineLabel,
					type: "scatter",
					data: source.map((datum, index) => ({
						...datum,
						value: [datum.baselineTotal, index],
					})),
					cursor: "pointer",
					symbolSize: 11,
					itemStyle: {
						color: "transparent",
						borderColor: baselineColor,
						borderWidth: 3,
					},
					z: 2,
				},
				{
					name: currentTitle,
					type: "scatter",
					data: source.map((datum) => ({
						...datum,
					})),
					silent: true,
					symbolSize: 1,
					itemStyle: { color: "transparent" },
					label: {
						show: showValueLabels,
						position: "right",
						distance: 8,
						color: "var(--color-foreground)",
						fontSize: chartTextSmFontSize,
						verticalAlign: "middle",
						formatter: (parameters: { data?: unknown }) => {
							const datum = getMoverDatum(parameters.data);
							return datum
								? formatCompactSignedCurrency(datum.difference, currency)
								: "";
						},
					},
					z: 3,
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
		<div className="space-y-3">
			<div className="flex flex-wrap items-end gap-x-6 gap-y-3 text-sm text-foreground">
				<div className="w-full max-w-sm space-y-1.5">
					<div className="flex justify-between gap-3">
						<span>Much less</span>
						<span>Close to usual</span>
						<span>Much more</span>
					</div>
					<div
						className="h-2 rounded-full"
						style={{
							background:
								"linear-gradient(in oklch to right, oklch(0.527 0.154 150.069) 0%, oklch(0.527 0.154 150.069 / 0) 42%, transparent 50%, oklch(0.577 0.245 27.325 / 0) 58%, oklch(0.577 0.245 27.325) 100%)",
						}}
					/>
				</div>
				<span className="inline-flex items-center gap-1.5">
					<span className="size-2.5 rounded-full border-2 border-muted-foreground bg-background" />
					Past amount
				</span>
			</div>
			<div
				ref={containerRef}
				className="h-64 w-full"
				role="img"
				aria-label={`Category spending in ${currentTitle} compared with ${baselineLabel}. Each bar fades from the hollow past amount into the current amount. The largest change has the strongest colour; increases are red and decreases are green. Select a bar to view its amount and transactions.`}
			/>
		</div>
	);
}
