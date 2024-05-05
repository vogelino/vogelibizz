import config from "$/drizzle.config";
import { connection, db } from "@/db";
import env from "@/env";
import { migrate } from "drizzle-orm/postgres-js/migrator";

if (!env.server.POSTGRES_MIGRATING) {
	throw new Error(
		'You must set POSTGRES_MIGRATING to "true" when running migrations',
	);
}

await migrate(db, { migrationsFolder: config.out! });

await connection.end();
