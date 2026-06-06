import { loadDotEnv } from "@/utility/loadDotEnv";

async function main() {
	loadDotEnv();

	const [{ migrate }, { getDb }, config] = await Promise.all([
		import("drizzle-orm/d1/migrator"),
		import("@/db"),
		import("$/drizzle.config"),
	]);

	if (!(globalThis as { DB?: unknown }).DB) {
		throw new Error(
			"D1 binding not found on globalThis.DB. Run migrations via wrangler so the DB binding is available.",
		);
	}

	await migrate(getDb(), { migrationsFolder: config.default.out! });
}

await main();
