"use client";

import { HeatmapChart } from "echarts/charts";
import {
	CalendarComponent,
	TooltipComponent,
	VisualMapComponent,
} from "echarts/components";
import type { EChartsCoreOption, EChartsType } from "echarts/core";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useMemo, useRef } from "react";
import { formatCurrency, locale } from "@/utility/formatUtil";
import type { SpendingHabits } from "../../spendingHabits";

echarts.use([
	HeatmapChart,
	CalendarComponent,
	TooltipComponent,
	VisualMapComponent,
	SVGRenderer,
]);

const spendingIntensityLegend = [
	{ value: 0, label: "No spending", color: "#eff6ff" },
	{ value: 1, label: "Lower", color: "#dbeafe" },
	{ value: 2, label: "Typical", color: "#93c5fd" },
	{ value: 3, label: "Higher", color: "#3b82f6" },
	{ value: 4, label: "Highest", color: "#1e3a8a" },
] as const;

type DailySpendingHeatmapProps = {
	habits: SpendingHabits;
	currency: string;
};

export function DailySpendingHeatmap({
	habits,
	currency,
}: DailySpendingHeatmapProps) {
	const scrollerRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<EChartsType | null>(null);

	const option = useMemo<EChartsCoreOption>(() => {
		const daysByDate = new Map(habits.days.map((day) => [day.date, day]));

		return {
			animationDuration: 350,
			tooltip: {
				formatter: (parameters: { value?: unknown }) => {
					const value = Array.isArray(parameters.value) ? parameters.value : [];
					const date = String(value[0] ?? "");
					const total = Number(value[1] ?? 0);
					const day = daysByDate.get(date);
					const formattedDate = new Intl.DateTimeFormat(locale, {
						weekday: "long",
						day: "numeric",
						month: "long",
						year: "numeric",
						timeZone: "UTC",
					}).format(new Date(`${date}T00:00:00Z`));
					const count = day?.transactionCount ?? 0;
					return [
						`<strong>${formattedDate}</strong>`,
						formatCurrency(total, currency),
						`${count} ${count === 1 ? "transaction" : "transactions"}`,
					].join("<br/>");
				},
			},
			visualMap: {
				type: "piecewise",
				show: false,
				dimension: 2,
				selectedMode: false,
				orient: "horizontal",
				left: 44,
				bottom: 0,
				itemWidth: 12,
				itemHeight: 12,
				itemGap: 12,
				textStyle: { color: "#98a2b3", fontSize: 11 },
				pieces: spendingIntensityLegend,
			},
			calendar: {
				top: 28,
				left: 44,
				right: 16,
				bottom: 12,
				range: habits.range,
				cellSize: ["auto", 18],
				splitLine: { show: false },
				itemStyle: {
					color: "rgba(152, 162, 179, 0.12)",
					borderWidth: 3,
					borderColor: "transparent",
				},
				dayLabel: {
					firstDay: 1,
					nameMap: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
					color: "#98a2b3",
					fontSize: 11,
				},
				monthLabel: {
					show: true,
					nameMap: "en",
					color: "#98a2b3",
					fontSize: 11,
				},
				yearLabel: { show: false },
			},
			series: [
				{
					type: "heatmap",
					coordinateSystem: "calendar",
					data: habits.days.map(({ date, total, intensity }) => [
						date,
						total,
						intensity,
					]),
					itemStyle: { borderRadius: 4 },
				},
			],
		};
	}, [currency, habits]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const chart = echarts.init(container, undefined, { renderer: "svg" });
		chartRef.current = chart;
		chart.setOption(option);
		let alignedToLatest = false;
		const alignToLatest = () => {
			if (alignedToLatest) return;
			const scroller = scrollerRef.current;
			if (scroller && scroller.scrollWidth > scroller.clientWidth) {
				scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
				alignedToLatest = true;
			}
		};
		const scrollFrame = window.requestAnimationFrame(alignToLatest);
		const scrollTimeout = window.setTimeout(alignToLatest, 100);
		const resizeObserver = new ResizeObserver(() => {
			chart.resize();
			alignToLatest();
		});
		resizeObserver.observe(container);
		const scroller = scrollerRef.current;
		if (scroller) resizeObserver.observe(scroller);
		return () => {
			window.cancelAnimationFrame(scrollFrame);
			window.clearTimeout(scrollTimeout);
			resizeObserver.disconnect();
			chart.dispose();
			chartRef.current = null;
		};
	}, [option]);

	return (
		<div className="space-y-3">
			<div ref={scrollerRef} className="overflow-x-auto pb-2">
				<div
					ref={containerRef}
					className="h-48 min-w-3xl"
					role="img"
					aria-label={`Daily spending calendar heatmap from ${habits.range[0]} to ${habits.range[1]}. Darker days indicate more spending; grey days have no imported data.`}
				/>
			</div>
			<ul
				className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"
				aria-label="Spending intensity legend"
			>
				{spendingIntensityLegend.map(({ value, label, color }) => (
					<li key={value} className="flex items-center gap-2">
						<span
							className="size-3 rounded-sm"
							style={{ backgroundColor: color }}
							aria-hidden="true"
						/>
						{label}
					</li>
				))}
			</ul>
		</div>
	);
}
