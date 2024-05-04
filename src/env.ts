import { config } from "dotenv";
import { expand } from "dotenv-expand";

import { ZodError, z } from "zod";

const stringBoolean = z.coerce
	.string()
	.transform((val) => {
		return val === "true";
	})
	.default("false");

const jwtRegex =
	/^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/gm;
const EnvSchema = z.object({
	// Node envs
	NODE_ENV: z.string().default("development"),

	// Database envs
	DB_HOST: z.string(),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
	DB_PORT: z.coerce.number(),
	DATABASE_URL: z.string(),
	DB_MIGRATING: stringBoolean,
	DB_SEEDING: stringBoolean,

	// Public envs
	NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z
		.string()
		.regex(jwtRegex, "Malformed supabase anon key. Not a valid JWT token."),
	NEXT_PUBLIC_OPENEXCHANGERATES_API_KEY: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

expand(config());

try {
	EnvSchema.parse(process.env);
} catch (error) {
	if (error instanceof ZodError) {
		let message = "Missing required values in .env:\n";
		// biome-ignore lint/complexity/noForEach: <explanation>
		error.issues.forEach((issue) => {
			message += `- ${issue.path[0]}\n`;
		});
		const e = new Error(message);
		e.stack = "";
		throw e;
	}
	console.error(error);
}

export default EnvSchema.parse(process.env);
