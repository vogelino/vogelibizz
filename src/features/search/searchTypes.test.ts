import { describe, expect, test } from "bun:test";

import { filtersFromTokens, getSearchScope, textFromTokens } from "./searchTypes";

describe("getSearchScope", () => {
  test("prefers expense history over its parent expense route", () => {
    expect(getSearchScope("/expenses/history/edit/12")).toBe("expense-history");
  });

  test("maps nested resource routes and leaves non-resource pages unscoped", () => {
    expect(getSearchScope("/projects/edit/2")).toBe("projects");
    expect(getSearchScope("/login")).toBeNull();
  });
});

test("tokens produce structured filters and table text", () => {
  const tokens = [
    { id: "text" as const, value: "figma", label: "Text: figma" },
    {
      id: "category:Software",
      filter: "category" as const,
      value: "Software",
      label: "Category: Software",
    },
    {
      id: "type:Freelance",
      filter: "type" as const,
      value: "Freelance",
      label: "Type: Freelance",
    },
  ];
  expect(filtersFromTokens(tokens)).toEqual({
    category: ["Software"],
    type: "Freelance",
  });
  expect(textFromTokens(tokens)).toBe("figma");
});
