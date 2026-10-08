import { describe, expect, test } from "bun:test";

import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";

import { getSpendingHabits } from "./spendingHabits";

const dashboard = {
  currency: "CHF",
  months: [{ month: "2025-06" }, { month: "2026-05" }, { month: "2026-06" }],
  days: [
    { date: "2025-06-01", total: 999, transactionCount: 1 },
    { date: "2026-05-04", total: 10, transactionCount: 1 },
    { date: "2026-05-11", total: 20, transactionCount: 2 },
    { date: "2026-05-18", total: 30, transactionCount: 1 },
    { date: "2026-06-01", total: 40, transactionCount: 1 },
  ],
} as ExpenseDashboard;

describe("getSpendingHabits", () => {
  test("summarizes the latest rolling year using only imported months", () => {
    const habits = getSpendingHabits(dashboard);

    expect(habits?.range).toEqual(["2025-07-01", "2026-06-30"]);
    expect(habits?.months).toEqual(["2026-05", "2026-06"]);
    expect(habits?.typicalSpendingDay).toBe(25);
    expect(habits?.spendingDayCount).toBe(4);
    expect(habits?.highestSpendWeekday).toBe("Monday");
    expect(habits?.coveredDayCount).toBe(61);
    expect(habits?.noSpendDayCount).toBe(57);
    expect(habits?.days.filter(({ intensity }) => intensity === 4)).toEqual([
      {
        date: "2026-06-01",
        total: 40,
        transactionCount: 1,
        intensity: 4,
      },
    ]);
  });

  test("returns no habits without imported months", () => {
    expect(
      getSpendingHabits({
        ...dashboard,
        months: [],
        days: [],
      }),
    ).toBeNull();
  });

  test("excludes purchase dates outside the imported months", () => {
    const habits = getSpendingHabits({
      ...dashboard,
      days: [...dashboard.days, { date: "2026-04-30", total: 15, transactionCount: 1 }],
    });

    expect(habits?.months).toEqual(["2026-05", "2026-06"]);
    expect(habits?.days.some(({ date }) => date === "2026-04-30")).toBe(false);
    expect(habits?.spendingDayCount).toBe(4);
  });

  test("includes imported months with no spending", () => {
    const habits = getSpendingHabits({
      ...dashboard,
      months: [...dashboard.months, { ...dashboard.months[1], month: "2026-04" }],
    });

    expect(habits?.months).toEqual(["2026-04", "2026-05", "2026-06"]);
    expect(habits?.days).toContainEqual({
      date: "2026-04-30",
      total: 0,
      transactionCount: 0,
      intensity: 0,
    });
  });
});
