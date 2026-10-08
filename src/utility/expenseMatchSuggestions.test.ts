import { describe, expect, test } from "bun:test";

import {
  createExpenseWithMatchesSchema,
  editExpenseWithMatchesSchema,
  isHighConfidenceExpenseMatch,
} from "./expenseMatchSuggestions";

describe("high-confidence expense matches", () => {
  test("accepts a clear merchant name and near-identical payment", () => {
    expect(
      isHighConfidenceExpenseMatch({
        name: "Netflix",
        expectedChfAmount: 19.9,
        description: "Payment to NETFLIX.com",
        amount: 19.95,
      }),
    ).toBe(true);
  });

  test("rejects short names, unrelated names, and different amounts", () => {
    const base = {
      name: "Netflix",
      expectedChfAmount: 19.9,
      description: "Netflix",
      amount: 19.9,
    };
    expect(isHighConfidenceExpenseMatch({ ...base, name: "Rent" })).toBe(false);
    expect(
      isHighConfidenceExpenseMatch({
        ...base,
        description: "Different merchant",
      }),
    ).toBe(false);
    expect(isHighConfidenceExpenseMatch({ ...base, amount: 25 })).toBe(false);
  });

  test("validates selected matches for creating and editing an expense", () => {
    const parsed = createExpenseWithMatchesSchema.parse({
      name: "Swimming membership",
      originalPrice: 8,
      originalCurrency: "CHF",
      rate: "Monthly",
      category: "Essentials",
      type: "Personal",
      matches: [{ id: 1, lastModified: "2026-09-22T00:00:00.000Z" }],
    });
    expect(parsed.name).toBe("Swimming membership");
    expect(parsed.matches).toHaveLength(1);
    expect(
      editExpenseWithMatchesSchema.parse({
        ...parsed,
        id: 2,
        lastModified: "2026-09-22T00:00:00.000Z",
      }).id,
    ).toBe(2);
  });
});
