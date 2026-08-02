import { describe, expect, test } from "bun:test";
import {
	applyRelationDelta,
	applyRelationIntents,
	commonValue,
	getRelationCounts,
	hasCommonValue,
	pickChanged,
	relationsFromOptionValues,
	runBulkEditsSequentially,
	unionRelations,
} from "./bulkEdit";

describe("bulk edit values", () => {
	test("returns a scalar only when every row has the same value", () => {
		const rows = [
			{ name: "Shared", status: "active" },
			{ name: "Different", status: "active" },
		];
		expect(commonValue(rows, "name")).toBeUndefined();
		expect(commonValue(rows, "status")).toBe("active");
		expect(hasCommonValue(rows, "name")).toBe(false);
		expect(hasCommonValue(rows, "status")).toBe(true);
	});

	test("keeps every relation represented by the selected rows", () => {
		const relations = unionRelations([
			{ relations: [{ id: 1, name: "One" }] },
			{
				relations: [
					{ id: 1, name: "One" },
					{ id: 2, name: "Two" },
				],
			},
		]);
		expect(relations).toEqual([
			{ id: 1, name: "One" },
			{ id: 2, name: "Two" },
		]);
	});

	test("maps numeric relation options without dropping the remaining pills", () => {
		const projects = [
			{ id: 1, name: "One" },
			{ id: 2, name: "Two" },
			{ id: 3, name: "Three" },
		];
		expect(
			relationsFromOptionValues([{ value: 1 }, { value: "3" }], projects),
		).toEqual([projects[0], projects[2]]);
	});

	test("applies relation additions and removals without replacing each row's configuration", () => {
		const one = { id: 1, name: "One" };
		const two = { id: 2, name: "Two" };
		const three = { id: 3, name: "Three" };
		const added = { id: 4, name: "Added" };
		const initialUnion = [one, two, three];
		const nextUnion = [one, three, added];

		expect(applyRelationDelta([], initialUnion, nextUnion)).toEqual([added]);
		expect(applyRelationDelta([one, two], initialUnion, nextUnion)).toEqual([
			one,
			added,
		]);
		expect(applyRelationDelta([three], initialUnion, nextUnion)).toEqual([
			three,
			added,
		]);
	});

	test("counts mixed relations and applies explicit tri-state operations", () => {
		const one = { id: 1, name: "One" };
		const two = { id: 2, name: "Two" };
		const three = { id: 3, name: "Three" };
		const rows = [[one, two], [two], []];
		expect(getRelationCounts(rows)).toEqual({ "1": 1, "2": 2 });
		expect(
			applyRelationIntents([one, two], [one, two, three], {
				"1": "add",
				"2": "remove",
				"3": "add",
			}),
		).toEqual([one, three]);
		expect(
			applyRelationIntents([], [one, two, three], {
				"1": "add",
				"2": "remove",
				"3": "add",
			}),
		).toEqual([one, three]);
	});

	test("submits only fields changed in the bulk form", () => {
		const value = { name: "", status: "done", rate: 100 };
		expect(pickChanged(value, new Set(["status", "rate"]))).toEqual({
			status: "done",
			rate: 100,
		});
	});

	test("runs edits sequentially so relation writes cannot overlap", async () => {
		const completed: number[] = [];
		let activeEdits = 0;
		let maximumActiveEdits = 0;
		await runBulkEditsSequentially([1, 2, 3], async (id) => {
			activeEdits += 1;
			maximumActiveEdits = Math.max(maximumActiveEdits, activeEdits);
			await Promise.resolve();
			completed.push(id);
			activeEdits -= 1;
		});
		expect(completed).toEqual([1, 2, 3]);
		expect(maximumActiveEdits).toBe(1);
	});
});
