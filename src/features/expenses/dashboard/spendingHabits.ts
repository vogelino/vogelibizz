import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { locale } from "@/utility/formatUtil";

export type SpendingHabitDay = ExpenseDashboard["days"][number] & {
	intensity: number;
};

export type SpendingHabits = {
	range: readonly [string, string];
	days: SpendingHabitDay[];
	typicalSpendingDay: number;
	spendingDayCount: number;
	highestSpendWeekday: string;
	highestSpendWeekdayAverage: number;
	noSpendDayCount: number;
	coveredDayCount: number;
	noSpendPercentage: number;
};

function monthStartOffset(month: string, offset: number) {
	const [year, monthNumber] = month.split("-").map(Number);
	return new Date(Date.UTC(year, monthNumber - 1 + offset, 1))
		.toISOString()
		.slice(0, 10);
}

function monthEnd(month: string) {
	const [year, monthNumber] = month.split("-").map(Number);
	return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
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

function percentile(values: readonly number[], fraction: number) {
	return values[Math.floor((values.length - 1) * fraction)] ?? 0;
}

function median(values: readonly number[]) {
	if (values.length === 0) return 0;
	const middle = Math.floor(values.length / 2);
	return values.length % 2 === 0
		? (values[middle - 1] + values[middle]) / 2
		: values[middle];
}

export function getSpendingHabits(
	dashboard: ExpenseDashboard,
): SpendingHabits | null {
	const latestMonth = dashboard.months.at(-1)?.month;
	if (!latestMonth) return null;

	const range = [
		monthStartOffset(latestMonth, -11),
		monthEnd(latestMonth),
	] as const;
	const importedMonths = new Set(
		dashboard.months
			.map(({ month }) => month)
			.filter((month) => month >= range[0].slice(0, 7)),
	);
	const totalsByDate = new Map(dashboard.days.map((day) => [day.date, day]));
	const coveredDates = [
		...new Set([
			...datesBetween(...range).filter((date) =>
				importedMonths.has(date.slice(0, 7)),
			),
			...dashboard.days
				.map(({ date }) => date)
				.filter((date) => date >= range[0] && date <= range[1]),
		]),
	].sort();
	const positiveTotals = coveredDates
		.map((date) => totalsByDate.get(date)?.total ?? 0)
		.filter((total) => total > 0)
		.sort((a, b) => a - b);
	const thresholds = [
		percentile(positiveTotals, 0.25),
		percentile(positiveTotals, 0.5),
		percentile(positiveTotals, 0.75),
	];
	const days = coveredDates.map((date) => {
		const day = totalsByDate.get(date);
		const total = day?.total ?? 0;
		const intensity =
			total === 0
				? 0
				: total <= thresholds[0]
					? 1
					: total <= thresholds[1]
						? 2
						: total <= thresholds[2]
							? 3
							: 4;
		return {
			date,
			total,
			transactionCount: day?.transactionCount ?? 0,
			intensity,
		};
	});

	const weekdayTotals = Array.from({ length: 7 }, () => ({
		total: 0,
		dayCount: 0,
	}));
	for (const day of days) {
		const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
		weekdayTotals[weekday].total += day.total;
		weekdayTotals[weekday].dayCount += 1;
	}
	const highestSpendWeekdayIndex = weekdayTotals.reduce(
		(highestIndex, weekday, index, rows) => {
			const average =
				weekday.dayCount === 0 ? 0 : weekday.total / weekday.dayCount;
			const highest = rows[highestIndex];
			const highestAverage =
				highest.dayCount === 0 ? 0 : highest.total / highest.dayCount;
			return average > highestAverage ? index : highestIndex;
		},
		0,
	);
	const highestSpendWeekday = weekdayTotals[highestSpendWeekdayIndex];
	const noSpendDayCount = days.filter(({ total }) => total === 0).length;

	return {
		range,
		days,
		typicalSpendingDay: median(positiveTotals),
		spendingDayCount: positiveTotals.length,
		highestSpendWeekday: new Intl.DateTimeFormat(locale, {
			weekday: "long",
			timeZone: "UTC",
		}).format(new Date(Date.UTC(2026, 6, 26 + highestSpendWeekdayIndex))),
		highestSpendWeekdayAverage:
			highestSpendWeekday.dayCount === 0
				? 0
				: highestSpendWeekday.total / highestSpendWeekday.dayCount,
		noSpendDayCount,
		coveredDayCount: days.length,
		noSpendPercentage:
			days.length === 0 ? 0 : (noSpendDayCount / days.length) * 100,
	};
}
