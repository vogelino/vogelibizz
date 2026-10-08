import { describe, expect, test } from "bun:test";

import { updateRangeSelection } from "./rangeSelection";

const rowIds = ["one", "two", "three", "four"];

describe("updateRangeSelection", () => {
  test("selects every row between the anchor and target", () => {
    expect(updateRangeSelection({}, rowIds, "two", "four", true)).toEqual({
      two: true,
      three: true,
      four: true,
    });
  });

  test("works when the target appears before the anchor", () => {
    expect(updateRangeSelection({}, rowIds, "four", "two", true)).toEqual({
      two: true,
      three: true,
      four: true,
    });
  });

  test("deselects a range without changing rows outside it", () => {
    expect(
      updateRangeSelection(
        { one: true, two: true, three: true, four: true },
        rowIds,
        "two",
        "three",
        false,
      ),
    ).toEqual({ one: true, four: true });
  });

  test("skips rows that cannot be selected", () => {
    expect(
      updateRangeSelection({}, rowIds, "one", "three", true, (rowId) => rowId !== "two"),
    ).toEqual({ one: true, three: true });
  });

  test("selects only the target when the anchor is no longer visible", () => {
    expect(updateRangeSelection({}, rowIds, "missing", "three", true)).toEqual({
      three: true,
    });
  });
});
