import { ZodError, z } from "zod";

const emailListSchema = z.string().transform((val) => {
	const emails = val.split(",");
	const emailArray = z.array(z.string().email()).parse(emails);
	return emailArray;
});

const PublicEnvSchema = z.object({
	VITE_PUBLIC_BASE_URL: z.url(),
	VITE_PUBLIC_OPENEXCHANGERATES_API_KEY: z.string(),
});

const ServerEnvSchema = PublicEnvSchema.merge(
	z.object({
		// Node envs
		NODE_ENV: z.string().default("development"),

		// Auth
		AUTH_URL: z.string().optional(),
		AUTH_SECRET: z.string(),
		AUTH_GITHUB_ID: z.string(),
		AUTH_GITHUB_SECRET: z.string(),
		AUTH_ADMIN_EMAILS: emailListSchema,
	}),
);

export type EnvSchema = z.infer<typeof ServerEnvSchema>;

function parseEnvSchema<T extends z.ZodSchema>(
	schema: T,
	env: Record<string, unknown>,
): z.infer<T> {
	try {
		return schema.parse(env);
	} catch (error) {
		if (error instanceof ZodError) {
			let message = "Missing required values in .env:\n";
			error.issues.forEach((issue) => {
				const issuePath = String(issue.path[0]);
				console.log(`- ${issuePath}: ${issue.message}`);
				message += `- ${issuePath}\n`;
			});
			const e = new Error(message);
			e.stack = "";
			throw e;
		}
		console.error(error);
		throw error;
	}
}
export default {
	get server(): z.infer<typeof ServerEnvSchema> {
		const processEnv =
			typeof process !== "undefined" && process.env ? process.env : {};
		const globalEnv =
			typeof globalThis !== "undefined"
				? ((globalThis as { __START_ENV__?: Record<string, unknown> })
						.__START_ENV__ ?? (globalThis as Record<string, unknown>))
				: {};
		return parseEnvSchema(ServerEnvSchema, {
			...globalEnv,
			...processEnv,
		});
	},
	get client(): z.infer<typeof PublicEnvSchema> {
		// Vite exposes public env vars via import.meta.env
		return parseEnvSchema(PublicEnvSchema, {
			VITE_PUBLIC_BASE_URL: import.meta.env.VITE_PUBLIC_BASE_URL,
			VITE_PUBLIC_OPENEXCHANGERATES_API_KEY: import.meta.env
				.VITE_PUBLIC_OPENEXCHANGERATES_API_KEY,
		});
	},
};
