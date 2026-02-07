import { loadDotEnv } from "@/utility/loadDotEnv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import env from "@/env";

loadDotEnv();

export const connection = postgres(env.server.POSTGRES_URL, {
	max:
		env.server.POSTGRES_MIGRATING || env.server.POSTGRES_SEEDING
			? 1
			: undefined,
	onnotice: env.server.POSTGRES_SEEDING ? () => {} : undefined,
});

export const db = drizzle(connection, {
	schema,
	logger: false,
});

export type db = typeof db;

export default db;
