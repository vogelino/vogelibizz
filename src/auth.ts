import NextAuth, { type Session } from "next-auth";
import GitHub from "next-auth/providers/github";
import env from "./env";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [GitHub],
});

export async function isAuthenticatedAndAdmin(session?: Session | null) {
	const { user } = session || (await auth()) || {};
	return user?.email === env.server.AUTH_ADMIN_EMAIL;
}
