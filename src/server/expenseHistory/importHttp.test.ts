import { describe, expect, test } from "bun:test";

import type {
  ExpenseHistoryImportCommitResult,
  ExpenseHistoryImportPreview,
} from "@/utility/expenseHistoryImportContracts";

import { ExpenseHistoryReplacementRequiredError } from "./importExpenseHistory";
import { createExpenseHistoryImportHandlers } from "./importHttp";

const workbookRequest = {
  workbookBase64: "synthetic-base64",
  sourceFilename: "synthetic.xlsx",
};
const preview: ExpenseHistoryImportPreview = {
  months: ["2026-06"],
  debitCount: 1,
  skippedCreditCount: 0,
  skippedCredits: [],
  totalDebitAmount: 12.5,
  warnings: [],
  replacementRequired: false,
  replacementMonths: [],
};

function post(body: unknown) {
  return new Request("https://example.test/api/expense-history/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("expense history import HTTP API", () => {
  test("requires administrator authentication", async () => {
    const handlers = createExpenseHistoryImportHandlers({
      authorize: async () => false,
      preview: async () => preview,
      commit: async () => ({
        ...preview,
        replacedExistingMonths: [],
      }),
    });
    const response = await handlers.preview(post(workbookRequest));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  test("returns the preview contract and validates request bodies", async () => {
    const handlers = createExpenseHistoryImportHandlers({
      authorize: async () => true,
      preview: async () => preview,
      commit: async () => ({
        ...preview,
        replacedExistingMonths: [],
      }),
    });
    const response = await handlers.preview(post(workbookRequest));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(preview);
    const invalid = await handlers.preview(post({ sourceFilename: "x.xlsx" }));
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({
      code: "INVALID_IMPORT_REQUEST",
    });
    const legacyCsv = await handlers.preview(post({ csv: "legacy", sourceFilename: "legacy.csv" }));
    expect(legacyCsv.status).toBe(400);
    expect(await legacyCsv.json()).toMatchObject({
      code: "INVALID_IMPORT_REQUEST",
    });
  });

  test("returns 409 for an unacknowledged replacement", async () => {
    const handlers = createExpenseHistoryImportHandlers({
      authorize: async () => true,
      preview: async () => ({
        ...preview,
        replacementRequired: true,
        replacementMonths: ["2026-06"],
      }),
      commit: async () => {
        throw new ExpenseHistoryReplacementRequiredError(["2026-06"]);
      },
    });
    const response = await handlers.commit(post(workbookRequest));
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      code: "EXPENSE_HISTORY_REPLACEMENT_REQUIRED",
      months: ["2026-06"],
    });
  });

  test("accepts explicit replacement acknowledgement", async () => {
    let acknowledged = false;
    const result: ExpenseHistoryImportCommitResult = {
      ...preview,
      replacementRequired: true,
      replacementMonths: ["2026-06"],
      replacedExistingMonths: ["2026-06"],
    };
    const handlers = createExpenseHistoryImportHandlers({
      authorize: async () => true,
      preview: async () => preview,
      commit: async (body) => {
        acknowledged = body.replaceExistingMonths;
        return result;
      },
    });
    const response = await handlers.commit(
      post({
        ...workbookRequest,
        replaceExistingMonths: true,
      }),
    );
    expect(response.status).toBe(200);
    expect(acknowledged).toBe(true);
    expect(await response.json()).toEqual(result);
  });

  test("logs unexpected failures and returns a searchable error reference", async () => {
    const originalConsoleError = console.error;
    const loggedErrors: unknown[][] = [];
    console.error = (...args) => loggedErrors.push(args);
    try {
      const handlers = createExpenseHistoryImportHandlers({
        authorize: async () => true,
        preview: async () => {
          throw new Error("database unavailable");
        },
        commit: async () => ({
          ...preview,
          replacedExistingMonths: [],
        }),
      });
      const response = await handlers.preview(post(workbookRequest));
      const body = (await response.json()) as {
        code: string;
        errorId: string;
      };

      expect(response.status).toBe(500);
      expect(body.code).toBe("EXPENSE_HISTORY_IMPORT_FAILED");
      expect(body.errorId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(loggedErrors).toHaveLength(1);
      expect(loggedErrors[0]?.[1]).toMatchObject({
        errorId: body.errorId,
        operation: "preview",
      });
    } finally {
      console.error = originalConsoleError;
    }
  });
});
