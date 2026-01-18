import env from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema/index.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: env.server.POSTGRES_URL,
	},
	verbose: true,
	strict: true,
});
