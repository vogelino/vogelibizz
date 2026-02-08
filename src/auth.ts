import type { AuthSession } from "start-authjs";
import { getSession } from "start-authjs";
import env from "@/env";
import { authConfig } from "@/utils/auth";

export type Session = AuthSession | null;

export async function auth(request?: Request): Promise<Session> {
	let resolvedRequest = request;
	if (!resolvedRequest && import.meta.env.SSR) {
		try {
			const { getStartContext } = await import(
				"@tanstack/start-storage-context"
			);
			resolvedRequest = getStartContext({ throwIfNotFound: false })?.request;
		} catch {
			resolvedRequest = undefined;
		}
	}
	if (!resolvedRequest) return null;
	return getSession(resolvedRequest, authConfig);
}

export async function isAuthenticatedAndAdmin(
	session?: Session | null,
	request?: Request,
) {
	const resolvedSession = session ?? (await auth(request));
	const email = resolvedSession?.user?.email;
	return !!email && env.server.AUTH_ADMIN_EMAILS.includes(email);
}
