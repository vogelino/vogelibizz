import { describe, expect, test } from "bun:test";
import { updateExpenseMatchSelection } from "./ExpenseMatchSuggestions";

describe("expense match selection", () => {
	test("shift-selects the range from the last clicked match", () => {
		const ids = [11, 12, 13, 14];
		const first = updateExpenseMatchSelection(
			new Set<number>(),
			ids,
			null,
			11,
			true,
			false,
		);
		const ranged = updateExpenseMatchSelection(first, ids, 11, 13, true, true);
		expect([...ranged]).toEqual([11, 12, 13]);
	});

	test("shift-unchecks a range while retaining other selections", () => {
		const ids = [11, 12, 13, 14];
		const ranged = updateExpenseMatchSelection(
			new Set(ids),
			ids,
			12,
			14,
			false,
			true,
		);
		expect([...ranged]).toEqual([11]);
	});
});
