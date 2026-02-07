import GitHub from "@auth/core/providers/github";
import type { StartAuthJSConfig } from "start-authjs";
import env from "@/env";

export const authConfig: StartAuthJSConfig = {
	secret: env.server.AUTH_SECRET,
	trustHost: true,
	providers: [
		GitHub({
			clientId: env.server.AUTH_GITHUB_ID,
			clientSecret: env.server.AUTH_GITHUB_SECRET,
		}),
	],
};
