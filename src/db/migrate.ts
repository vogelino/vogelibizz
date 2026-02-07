import { loadDotEnv } from "@/utility/loadDotEnv";

async function main() {
	loadDotEnv();

	const [{ migrate }, { connection, db }, env, config] = await Promise.all([
		import("drizzle-orm/postgres-js/migrator"),
		import("@/db"),
		import("@/env"),
		import("$/drizzle.config"),
	]);

	if (!env.default.server.POSTGRES_MIGRATING) {
		throw new Error(
			'You must set POSTGRES_MIGRATING to "true" when running migrations',
		);
	}

	await migrate(db, { migrationsFolder: config.default.out! });

	await connection.end();
}

await main();
