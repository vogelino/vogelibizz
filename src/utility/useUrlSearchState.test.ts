import { describe, expect, test } from "bun:test";
import { mergeUrlSearchState } from "./useUrlSearchState";

describe("mergeUrlSearchState", () => {
	test("preserves unrelated search parameters", () => {
		expect(
			mergeUrlSearchState(
				{ month: "2026-06", category: ["Food"] },
				{ category: ["Travel"], archivedOnly: true },
				{ category: [], archivedOnly: false },
			),
		).toEqual({
			month: "2026-06",
			category: ["Travel"],
			archivedOnly: true,
		});
	});

	test("removes values that match defaults", () => {
		expect(
			mergeUrlSearchState(
				{ month: "2026-06", category: ["Food"], archivedOnly: true },
				{ category: [], archivedOnly: false },
				{ category: [], archivedOnly: false },
			),
		).toEqual({ month: "2026-06" });
	});
});
