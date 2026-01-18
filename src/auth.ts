import NextAuth, { type Session } from "next-auth";
import GitHub from "next-auth/providers/github";
import env from "./env";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		GitHub({
			clientId: env.server.AUTH_GITHUB_ID,
			clientSecret: env.server.AUTH_GITHUB_SECRET,
		}),
	],
	secret: env.server.AUTH_SECRET,
	trustHost: true,
});

export async function isAuthenticatedAndAdmin(session?: Session | null) {
	const { user } = session || (await auth()) || {};
	return user?.email && env.server.AUTH_ADMIN_EMAILS.includes(user.email);
}
