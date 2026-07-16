import { describe, expect, test } from "bun:test";
import { getDbProxyProperty } from "./index";

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
});
