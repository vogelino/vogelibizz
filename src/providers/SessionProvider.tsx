import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Session = {
	user?: {
		name?: string;
		email?: string;
		image?: string;
	};
} | null;

type SessionContextValue = {
	data: Session;
	status: "loading" | "authenticated" | "unauthenticated";
};

const SessionContext = createContext<SessionContextValue>({
	data: null,
	status: "unauthenticated",
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session>(null);
	const [status, setStatus] =
		useState<SessionContextValue["status"]>("unauthenticated");

	useEffect(() => {
		let canceled = false;
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3000);

		async function loadSession() {
			setStatus("loading");
			try {
				const response = await fetch("/api/auth/session", {
					credentials: "include",
					signal: controller.signal,
				});
				if (!response.ok) throw new Error("Failed to fetch session");
				const data = await response.json();
				if (canceled) return;
				const nextSession = Object.keys(data || {}).length ? data : null;
				setSession(nextSession);
				setStatus(nextSession ? "authenticated" : "unauthenticated");
			} catch (_err) {
				if (canceled) return;
				setSession(null);
				setStatus("unauthenticated");
			}
		}

		void loadSession();

		return () => {
			clearTimeout(timeout);
			canceled = true;
			controller.abort();
		};
	}, []);

	const value = useMemo(
		() => ({
			data: session,
			status,
		}),
		[session, status],
	);

	return (
		<SessionContext.Provider value={value}>{children}</SessionContext.Provider>
	);
}

export function useSession() {
	return useContext(SessionContext);
}

export function signIn({
	redirectTo = "/projects",
	provider = "github",
}: {
	redirectTo?: string;
	provider?: string;
} = {}) {
	if (typeof window !== "undefined") {
		const params = new URLSearchParams({ callbackUrl: redirectTo });
		window.location.assign(`/api/auth/signin/${provider}?${params.toString()}`);
	}
}

export function signOut({
	redirectTo = "/login",
}: {
	redirectTo?: string;
} = {}) {
	if (typeof window !== "undefined") {
		const params = new URLSearchParams({ callbackUrl: redirectTo });
		window.location.assign(`/api/auth/signout?${params.toString()}`);
	}
}
