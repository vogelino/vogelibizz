import { describe, expect, test } from "bun:test";
import { mergeUrlSearchState } from "./useUrlSearchState";

describe("mergeUrlSearchState", () => {
	test("preserves unrelated search parameters", () => {
		expect(
			mergeUrlSearchState(
				{ month: "2026-06", category: ["Food"] },
				{ category: ["Travel"], otherOnly: true },
				{ category: [], otherOnly: false },
			),
		).toEqual({
			month: "2026-06",
			category: ["Travel"],
			otherOnly: true,
		});
	});

	test("removes values that match defaults", () => {
		expect(
			mergeUrlSearchState(
				{ month: "2026-06", category: ["Food"], otherOnly: true },
				{ category: [], otherOnly: false },
				{ category: [], otherOnly: false },
			),
		).toEqual({ month: "2026-06" });
	});
});
