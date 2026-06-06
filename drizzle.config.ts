import { loadDotEnv } from "@/utility/loadDotEnv";
import { defineConfig } from "drizzle-kit";

loadDotEnv();

export default defineConfig({
	schema: "./src/db/schema/index.ts",
	out: "./src/db/migrations/d1",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: process.env.CF_ACCOUNT_ID ?? "",
		databaseId:
			process.env.CF_D1_DATABASE_ID ?? "3e20bfb2-6c46-4e83-8760-957d3b91ae84",
		token: process.env.CF_D1_TOKEN ?? "",
	},
	verbose: true,
	strict: true,
});
