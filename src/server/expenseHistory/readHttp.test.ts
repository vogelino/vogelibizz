import { describe, expect, test } from "bun:test";

import type {
  ExpenseDashboard,
  ExpenseHistoryMonthDetail,
  ExpenseHistoryMonthSummary,
  ExpenseHistorySort,
  ExpenseHistoryTransactionDetail,
  ExpenseOverviewSummary,
} from "@/utility/expenseHistoryContracts";
import {
  expenseDashboardSchema,
  expenseHistoryMonthDetailSchema,
  expenseHistoryMonthsSchema,
  expenseHistoryTransactionDetailSchema,
  expenseOverviewSummarySchema,
} from "@/utility/expenseHistoryContracts";

import { createExpenseHistoryReadHandlers } from "./readHttp";

const months: ExpenseHistoryMonthSummary[] = [
  {
    month: "2026-06",
    importedAt: "2026-07-16T12:00:00.000Z",
    importedDebitCount: 1,
    skippedCreditCount: 2,
  },
];
const detail: ExpenseHistoryMonthDetail = {
  currency: "CHF",
  month: months[0],
  transactions: [
    {
      id: 7,
      bookedAt: "2026-06-03",
      occurredAt: "2026-06-01T18:42",
      valueDate: "2026-06-04",
      description: "Editable display value",
      amount: 12.5,
      originalDescription: "Immutable bank value",
      originalAmount: 15,
      category: "Software",
      type: "Freelance",
      expense: { id: 4, name: "Synthetic recurring" },
      lastModified: "2026-07-16T12:00:00.000Z",
    },
  ],
  summary: { total: 12.5, matched: 12.5, other: 0 },
  totalCount: 1,
  nextOffset: null,
};
const overview: ExpenseOverviewSummary = {
  currency: "CHF",
  importedMonthCount: 1,
  configuredMonthlyTotal: 30,
  recurring: [{ expenseId: 4, total: 12.5, monthlyAverage: 12.5 }],
  other: { total: 5, monthlyAverage: 5 },
  livingCostEstimate: 35,
  observedMonthlyAverage: 17.5,
};
const transactionDetail: ExpenseHistoryTransactionDetail = {
  month: "2026-06",
  transaction: detail.transactions[0],
};
const dashboard: ExpenseDashboard = {
  currency: "CHF",
  importedMonthCount: 1,
  configuredMonthlyTotal: 30,
  configuredMonthlySavings: 0,
  typicalMonthlyTotal: 17.5,
  days: [{ date: "2026-06-03", total: 17.5, transactionCount: 1 }],
  months: [
    {
      month: "2026-06",
      total: 17.5,
      savings: 0,
      matched: 12.5,
      unmatched: 5,
      unmatchedCount: 1,
      uncategorizedCount: 0,
      reviewCount: 0,
      categories: [{ category: "Software", total: 17.5, transactionCount: 1 }],
    },
  ],
  latest: {
    month: "2026-06",
    total: 17.5,
    savings: 0,
    previousTotal: null,
    matched: 12.5,
    unmatched: 5,
    unmatchedCount: 1,
    uncategorizedTotal: 0,
    uncategorizedCount: 0,
    reviewCount: 0,
    categories: [{ category: "Software", total: 17.5, transactionCount: 1 }],
  },
  recurring: [
    {
      expenseId: 4,
      name: "Synthetic recurring",
      category: "Software",
      rate: "Monthly",
      plannedMonthly: 30,
      plannedCharge: 30,
      actualMonthlyAverage: 12.5,
      difference: -17.5,
      monthlyActuals: [{ month: "2026-06", total: 12.5, transactionCount: 1 }],
    },
  ],
};

function request() {
  return new Request("https://example.test/api/expense-history/months");
}

describe("expense history read HTTP API", () => {
  test("requires administrator authentication", async () => {
    const handlers = createExpenseHistoryReadHandlers({
      authorize: async () => false,
      getMonths: async () => months,
      getMonth: async () => detail,
      getOverview: async () => overview,
      getTransaction: async () => transactionDetail,
    });
    const response = await handlers.months(request());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect((await handlers.overview(request())).status).toBe(401);
    expect((await handlers.dashboard(request())).status).toBe(401);
    expect((await handlers.transaction(request(), "7")).status).toBe(401);
  });

  test("returns newest-first month summaries and the traceable row contract", async () => {
    const handlers = createExpenseHistoryReadHandlers({
      authorize: async () => true,
      getMonths: async () => months,
      getMonth: async () => detail,
      getOverview: async () => overview,
      getTransaction: async () => transactionDetail,
    });
    const monthsResponse = await handlers.months(request());
    expect(expenseHistoryMonthsSchema.parse(await monthsResponse.json())).toEqual(months);

    const monthResponse = await handlers.month(request(), "2026-06");
    expect(expenseHistoryMonthDetailSchema.parse(await monthResponse.json())).toEqual(detail);

    const transactionResponse = await handlers.transaction(request(), "7");
    expect(expenseHistoryTransactionDetailSchema.parse(await transactionResponse.json())).toEqual(
      transactionDetail,
    );
  });

  test("returns the calculation summary contract", async () => {
    const handlers = createExpenseHistoryReadHandlers({
      authorize: async () => true,
      getMonths: async () => months,
      getMonth: async () => detail,
      getOverview: async () => overview,
      getTransaction: async () => transactionDetail,
    });
    const response = await handlers.overview(request());
    expect(expenseOverviewSummarySchema.parse(await response.json())).toEqual(overview);
  });

  test("returns the dashboard contract", async () => {
    const handlers = createExpenseHistoryReadHandlers({
      authorize: async () => true,
      getDashboard: async () => dashboard,
    });
    const response = await handlers.dashboard(request());
    expect(expenseDashboardSchema.parse(await response.json())).toEqual(dashboard);
  });

  test("validates and forwards infinite-scroll pagination", async () => {
    let receivedPagination: { offset?: number; limit?: number } | undefined;
    const handlers = createExpenseHistoryReadHandlers({
      authorize: async () => true,
      getMonths: async () => months,
      getMonth: async (_month, pagination) => {
        receivedPagination = pagination;
        return detail;
      },
      getOverview: async () => overview,
      getTransaction: async () => transactionDetail,
    });
    const response = await handlers.month(
      new Request("https://example.test/api/expense-history/months/2026-06?offset=50&limit=25"),
      "2026-06",
    );
    expect(response.status).toBe(200);
    expect(receivedPagination).toEqual({ offset: 50, limit: 25 });

    const invalid = await handlers.month(
      new Request("https://example.test/api/expense-history/months/2026-06?offset=-1&limit=101"),
      "2026-06",
    );
    expect(invalid.status).toBe(400);
  });

  test("validates and forwards backend sorting", async () => {
    let receivedOptions: { offset?: number; limit?: number; sort?: ExpenseHistorySort } | undefined;
    const handlers = createExpenseHistoryReadHandlers({
      authorize: async () => true,
      getMonth: async (_month, options) => {
        receivedOptions = options;
        return detail;
      },
    });
    const response = await handlers.month(
      new Request(
        "https://example.test/api/expense-history/months/2026-06?sort=amount&direction=desc",
      ),
      "2026-06",
    );
    expect(response.status).toBe(200);
    expect(receivedOptions).toEqual({
      offset: 0,
      limit: 50,
      sort: { field: "amount", direction: "desc" },
    });

    for (const query of [
      "sort=unknown&direction=asc",
      "sort=amount",
      "direction=desc",
      "sort=amount&direction=sideways",
    ]) {
      const invalid = await handlers.month(
        new Request(`https://example.test/api/expense-history/months/2026-06?${query}`),
        "2026-06",
      );
      expect(invalid.status).toBe(400);
    }
  });

  test("uses a null month filter for the all-transactions feed", async () => {
    let receivedMonth: string | null | undefined;
    const handlers = createExpenseHistoryReadHandlers({
      authorize: async () => true,
      getMonths: async () => months,
      getMonth: async (month) => {
        receivedMonth = month;
        return { ...detail, month: null };
      },
      getOverview: async () => overview,
      getTransaction: async () => transactionDetail,
    });
    const response = await handlers.month(request(), "all");
    expect(response.status).toBe(200);
    expect(receivedMonth).toBeNull();
    expect(expenseHistoryMonthDetailSchema.parse(await response.json()).month).toBeNull();
  });

  test("rejects malformed and missing selected months", async () => {
    const handlers = createExpenseHistoryReadHandlers({
      authorize: async () => true,
      getMonths: async () => months,
      getMonth: async () => null,
      getOverview: async () => overview,
      getTransaction: async () => null,
    });
    expect((await handlers.month(request(), "June")).status).toBe(400);
    const missing = await handlers.month(request(), "2026-05");
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({
      error: "No expense history exists for 2026-05.",
    });
    expect((await handlers.transaction(request(), "invalid")).status).toBe(400);
    expect((await handlers.transaction(request(), "7")).status).toBe(404);
  });
});
