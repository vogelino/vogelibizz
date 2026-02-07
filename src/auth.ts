import type { Session } from "@/providers/SessionProvider";

export async function auth(): Promise<Session> {
	return null;
}

export async function isAuthenticatedAndAdmin(_session?: Session | null) {
	return true;
}
