import { describe, expect, test } from "bun:test";

import {
  amountSearchText,
  createSearchIndex,
  filterRowsByText,
  searchDocuments,
  searchFilterOptions,
} from "./searchEngine";
import type { SearchDocument, SearchFilterOption } from "./searchTypes";

const documents: SearchDocument[] = [
  {
    id: "expense:1",
    resourceId: "1",
    kind: "expense",
    scope: "expenses",
    title: "Figma subscription",
    subtitle: "Software Freelance",
    keywords: `design monthly ${amountSearchText(1299.5, "CHF")}`,
    category: "Software",
    type: "Freelance",
  },
  {
    id: "expense:2",
    resourceId: "2",
    kind: "expense",
    scope: "expenses",
    title: "Health insurance",
    subtitle: "Health & Wellbeing Personal",
    keywords: "monthly",
    category: "Health & Wellbeing",
    type: "Personal",
  },
  {
    id: "project:1",
    resourceId: "1",
    kind: "project",
    scope: "projects",
    title: "Figma redesign",
    subtitle: "active",
    keywords: "Client A",
    status: "active",
  },
];

describe("searchDocuments", () => {
  const index = createSearchIndex(documents);

  test("supports fuzzy matching and page scopes", () => {
    expect(
      searchDocuments(index, "figm", "expenses", { category: [] }).map((result) => result.id),
    ).toEqual(["expense:1"]);
  });

  test("searches all scopes when the scope chip is removed", () => {
    expect(
      searchDocuments(index, "figma", null, { category: [] }).map((result) => result.id),
    ).toEqual(["expense:1", "project:1"]);
  });

  test("combines category and type filters", () => {
    expect(
      searchDocuments(index, "", "expenses", {
        category: ["Software"],
        type: "Freelance",
      }).map((result) => result.id),
    ).toEqual(["expense:1"]);
  });

  test("matches raw and currency-formatted amounts", () => {
    expect(
      searchDocuments(index, "1299.5", "expenses", { category: [] }).map((result) => result.id),
    ).toEqual(["expense:1"]);
    expect(
      searchDocuments(index, "CHF 1’299.50", "expenses", {
        category: [],
      }).map((result) => result.id),
    ).toEqual(["expense:1"]);
  });
});

test("filterRowsByText returns typo-tolerant table matches", () => {
  const rows = [
    { id: 1, name: "Acme Corporation" },
    { id: 2, name: "Vogelino" },
  ];
  expect(
    filterRowsByText(
      rows,
      "coporation",
      (row) => row.id,
      (row) => row.name,
    ).map(({ id }) => id),
  ).toEqual([1]);
});

test("filter options are fuzzy, scoped, and exclude active chips", () => {
  const options: SearchFilterOption[] = [
    {
      id: "category:Software",
      filter: "category",
      value: "Software",
      label: "Category: Software",
      keywords: "filter category software",
      scopes: ["expenses", "expense-history"],
    },
    {
      id: "type:Personal",
      filter: "type",
      value: "Personal",
      label: "Type: Personal",
      keywords: "filter type personal",
      scopes: ["expenses", "expense-history"],
    },
  ];
  expect(
    searchFilterOptions(options, "softwre", "expenses", new Set()).map((option) => option.id),
  ).toEqual(["category:Software"]);
  expect(searchFilterOptions(options, "software", "projects", new Set())).toEqual([]);
  expect(
    searchFilterOptions(options, "software", "expenses", new Set(["category:Software"])),
  ).toEqual([]);
});
