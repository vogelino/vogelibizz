"use client";

import { HeatmapChart } from "echarts/charts";
import { CalendarComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
import type { EChartsCoreOption, EChartsType } from "echarts/core";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatCurrency, locale } from "@/utility/formatUtil";

import type { SpendingHabits } from "../../spendingHabits";
import { chartTextStyle, chartTooltipStyle } from "../chartTooltipStyle";

echarts.use([HeatmapChart, CalendarComponent, TooltipComponent, VisualMapComponent, SVGRenderer]);

const spendingIntensityLevels = [
  { value: 0, label: "No spending", strength: 0 },
  { value: 1, label: "Lower", strength: 0.2 },
  { value: 2, label: "Typical", strength: 0.45 },
  { value: 3, label: "Higher", strength: 0.7 },
  { value: 4, label: "Highest", strength: 1 },
] as const;
const spendingIntensityLegend = spendingIntensityLevels.map(({ strength, ...entry }) => ({
  ...entry,
  color: `rgba(37, 99, 235, ${strength})`,
}));
const emptyCellColor = "var(--chart-plot-background)";
const minimumCellSize = 18;
const maximumCellSize = 40;
const monthGap = 20;
const chartLeft = 44;
const chartRight = 16;

function monthEnd(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
}

function monthWeekCount(month: string) {
  const firstDay = new Date(`${month}-01T00:00:00Z`).getUTCDay();
  const mondayOffset = (firstDay + 6) % 7;
  return Math.ceil((mondayOffset + Number(monthEnd(month).slice(-2))) / 7);
}

function datesBetween(start: string, end: string) {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

type DailySpendingHeatmapProps = {
  habits: SpendingHabits;
  currency: string;
};

export function DailySpendingHeatmap({ habits, currency }: DailySpendingHeatmapProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const totalWeeks = habits.months.reduce((weeks, month) => weeks + monthWeekCount(month), 0);
  const cellSize = Math.min(
    maximumCellSize,
    Math.max(
      minimumCellSize,
      (availableWidth - chartLeft - chartRight - monthGap * (habits.months.length - 1)) /
        (totalWeeks || 1),
    ),
  );
  const calendarPositions = useMemo(() => {
    let left = chartLeft;
    return habits.months.map((month) => {
      const position = { month, left };
      left += monthWeekCount(month) * cellSize + monthGap;
      return position;
    });
  }, [cellSize, habits.months]);
  const chartWidth =
    (calendarPositions.at(-1)?.left ?? chartLeft) +
    monthWeekCount(habits.months.at(-1) ?? habits.range[1].slice(0, 7)) * cellSize +
    chartRight;
  const chartHeight = Math.max(192, cellSize * 7 + 40);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const resizeObserver = new ResizeObserver(() => {
      setAvailableWidth(scroller.clientWidth);
    });
    resizeObserver.observe(scroller);
    setAvailableWidth(scroller.clientWidth);
    return () => resizeObserver.disconnect();
  }, []);

  const option = useMemo<EChartsCoreOption>(() => {
    const daysByDate = new Map(habits.days.map((day) => [day.date, day]));
    const missingSeriesIndexes = calendarPositions.map((_, index) => index * 2);
    const spendingSeriesIndexes = calendarPositions.map((_, index) => index * 2 + 1);

    return {
      animationDuration: 350,
      tooltip: {
        ...chartTooltipStyle,
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
            `<span class="text-muted-foreground">${count} ${count === 1 ? "transaction" : "transactions"}</span>`,
          ].join("<br/>");
        },
      },
      visualMap: [
        {
          type: "piecewise",
          show: false,
          seriesIndex: missingSeriesIndexes,
          pieces: [{ value: 0, color: emptyCellColor }],
        },
        {
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
          textStyle: chartTextStyle,
          seriesIndex: spendingSeriesIndexes,
          pieces: spendingIntensityLegend,
        },
      ],
      calendar: calendarPositions.map(({ month, left }, index) => ({
        top: 28,
        left,
        bottom: 12,
        range: [`${month}-01`, monthEnd(month)],
        cellSize: [cellSize, cellSize],
        splitLine: { show: false },
        itemStyle: {
          color: "transparent",
          borderWidth: 3,
          borderColor: "transparent",
        },
        dayLabel: {
          show: index === 0,
          firstDay: 1,
          nameMap: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          ...chartTextStyle,
        },
        monthLabel: {
          show: true,
          nameMap: "en",
          ...chartTextStyle,
        },
        yearLabel: { show: false },
      })),
      series: calendarPositions.flatMap(({ month }, index) => {
        const monthDays = habits.days.filter(({ date }) => date.startsWith(month));
        const missingDates = datesBetween(`${month}-01`, monthEnd(month)).filter(
          (date) => !daysByDate.has(date),
        );
        return [
          {
            type: "heatmap",
            coordinateSystem: "calendar",
            calendarIndex: index,
            silent: true,
            itemStyle: { color: emptyCellColor },
            data: missingDates.map((date) => [date, 0]),
          },
          {
            type: "heatmap",
            coordinateSystem: "calendar",
            calendarIndex: index,
            data: monthDays.map(({ date, total, intensity }) => [date, total, intensity]),
          },
        ];
      }),
    };
  }, [calendarPositions, cellSize, currency, habits]);

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
          style={{ width: chartWidth, height: chartHeight }}
          role="img"
          aria-label={`Daily spending calendar heatmap for imported months ${habits.months.join(", ")}. Stronger blue indicates more spending; grey days have no imported data.`}
        />
      </div>
      <ul
        className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-foreground"
        aria-label="Spending intensity legend"
      >
        {spendingIntensityLegend.map(({ value, label, color }) => (
          <li key={value} className="flex items-center gap-2">
            <span className="size-3" style={{ backgroundColor: color }} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
