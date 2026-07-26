import { describe, expect, test } from "bun:test";
import {
	addSearchFilter,
	getSearchTokens,
	removeSearchToken,
} from "./searchUrlState";

describe("search URL state", () => {
	test("maps each expense scope to its validated search keys", () => {
		expect(
			getSearchTokens("expenses", {
				q: "hosting",
				categories: ["Software"],
				expenseType: "Business",
				expenseOtherOnly: true,
			}),
		).toEqual([
			{ id: "text", value: "hosting", label: "Text: hosting" },
			{
				id: "category:Software",
				filter: "category",
				value: "Software",
				label: "Category: Software",
			},
			{
				id: "type:Business",
				filter: "type",
				value: "Business",
				label: "Type: Business",
			},
			{
				id: "association:other",
				filter: "otherOnly",
				value: "true",
				label: "Association: Other only",
			},
		]);

		expect(
			getSearchTokens("expense-history", {
				category: ["Travel"],
				type: "Personal",
				otherOnly: true,
			}).map(({ id }) => id),
		).toEqual(["category:Travel", "type:Personal", "association:other"]);
	});

	test("preserves unrelated keys and omits an empty canonical default", () => {
		const option = {
			id: "category:Software",
			filter: "category" as const,
			value: "Software",
			label: "Category: Software",
			keywords: "filter category software",
			scopes: ["expenses"] as const,
		};
		const withCategory = addSearchFilter(
			{ fromMonth: "2026-01" },
			"expenses",
			option,
		);

		expect(withCategory).toEqual({
			fromMonth: "2026-01",
			categories: ["Software"],
		});
		expect(
			removeSearchToken(withCategory, "expenses", {
				id: option.id,
				filter: option.filter,
				value: option.value,
				label: option.label,
			}),
		).toEqual({ fromMonth: "2026-01" });
	});
});
