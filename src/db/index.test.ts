import { describe, expect, test } from "bun:test";
import type { D1Database } from "@/db/d1Types";
import { getDb, getDbProxyProperty } from "./index";

describe("database proxy", () => {
	test("binds method receivers while preserving data properties", () => {
		const database = {
			marker: "database receiver",
			batch() {
				return this.marker;
			},
		};

		const batch = getDbProxyProperty(database, "batch") as () => string;
		expect(batch()).toBe("database receiver");
		expect(getDbProxyProperty(database, "marker")).toBe("database receiver");
	});

	test("does not cache a request-bound database instance globally", () => {
		const runtime = globalThis as { DB?: D1Database };
		const originalDatabase = runtime.DB;
		runtime.DB = {} as D1Database;

		try {
			expect(getDb()).not.toBe(getDb());
		} finally {
			runtime.DB = originalDatabase;
		}
	});
});
