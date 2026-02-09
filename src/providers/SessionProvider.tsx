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

async function getCsrfToken(): Promise<string | null> {
	try {
		const response = await fetch("/api/auth/csrf", {
			credentials: "include",
		});
		if (!response.ok) return null;
		const data = (await response.json()) as { csrfToken?: string };
		return data.csrfToken ?? null;
	} catch {
		return null;
	}
}

function submitPostForm(action: string, fields: Record<string, string>) {
	const form = document.createElement("form");
	form.method = "POST";
	form.action = action;
	for (const [name, value] of Object.entries(fields)) {
		const input = document.createElement("input");
		input.type = "hidden";
		input.name = name;
		input.value = value;
		form.appendChild(input);
	}
	document.body.appendChild(form);
	form.submit();
}

export async function signIn({
	redirectTo = "/projects",
	provider = "github",
}: {
	redirectTo?: string;
	provider?: string;
} = {}) {
	if (typeof window === "undefined") return;
	const csrfToken = await getCsrfToken();
	if (!csrfToken) {
		window.location.assign(
			`/api/auth/signin?callbackUrl=${encodeURIComponent(redirectTo)}`,
		);
		return;
	}
	submitPostForm(`/api/auth/signin/${provider}`, {
		csrfToken,
		callbackUrl: redirectTo,
	});
}

export async function signOut({
	redirectTo = "/login",
}: {
	redirectTo?: string;
} = {}) {
	if (typeof window === "undefined") return;
	const csrfToken = await getCsrfToken();
	if (!csrfToken) {
		window.location.assign(
			`/api/auth/signout?callbackUrl=${encodeURIComponent(redirectTo)}`,
		);
		return;
	}
	submitPostForm("/api/auth/signout", {
		csrfToken,
		callbackUrl: redirectTo,
	});
}
