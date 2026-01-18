import { migrate } from "drizzle-orm/postgres-js/migrator";
import { connection, db } from "@/db";
import env from "@/env";
import config from "$/drizzle.config";

if (!env.server.POSTGRES_MIGRATING) {
	throw new Error(
		'You must set POSTGRES_MIGRATING to "true" when running migrations',
	);
}

await migrate(db, { migrationsFolder: config.out! });

await connection.end();
