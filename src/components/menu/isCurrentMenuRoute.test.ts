import { describe, expect, test } from "bun:test";

import { isCurrentMenuRoute } from "./isCurrentMenuRoute";

describe("menu route matching", () => {
  test("marks an exact submenu destination as current", () => {
    expect(isCurrentMenuRoute("expenses/dashboard", "/expenses/dashboard")).toBe(true);
    expect(isCurrentMenuRoute("expenses/history", "/expenses/history")).toBe(true);
  });

  test("keeps a submenu active on its nested pages", () => {
    expect(isCurrentMenuRoute("expenses/history/edit/12", "/expenses/history")).toBe(true);
  });

  test("does not treat every expenses page as recurring expenses", () => {
    expect(isCurrentMenuRoute("expenses", "/expenses")).toBe(true);
    expect(isCurrentMenuRoute("expenses/dashboard", "/expenses")).toBe(false);
    expect(isCurrentMenuRoute("expenses/history", "/expenses")).toBe(false);
  });
});
