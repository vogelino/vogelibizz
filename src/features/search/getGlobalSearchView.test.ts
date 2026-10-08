import { describe, expect, test } from "bun:test";
import { getGlobalSearchView } from "./getGlobalSearchView";
import { createSearchIndex } from "./searchEngine";

describe("global search view", () => {
	test("offers a text filter for a selected scope on another page", () => {
		const view = getGlobalSearchView({
			open: true,
			scope: "expense-history",
			currentScope: "expenses",
			tokens: [],
			query: "coffee",
			index: createSearchIndex([]),
			filterOptions: [],
			loading: false,
			error: false,
		});

		expect(view.canApplyTextFilter).toBe(true);
	});

	test("does not offer a text filter without a destination scope", () => {
		const view = getGlobalSearchView({
			open: true,
			scope: null,
			currentScope: "expenses",
			tokens: [],
			query: "coffee",
			index: createSearchIndex([]),
			filterOptions: [],
			loading: false,
			error: false,
		});

		expect(view.canApplyTextFilter).toBe(false);
	});
});
