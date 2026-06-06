import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { sessionQueryOptions } from "@/utility/data/queryOptions";
import { apiGetJson, apiPostForm } from "@/utility/dataHookUtil";

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
	const { data: session = null, status: queryStatus } = useQuery(
		sessionQueryOptions(),
	);
	const status: SessionContextValue["status"] =
		queryStatus === "pending"
			? "loading"
			: session
				? "authenticated"
				: "unauthenticated";

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
		const data = await apiGetJson<{ csrfToken?: string }>("/api/auth/csrf");
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
		window.location.assign(redirectTo);
		return;
	}

	const response = await apiPostForm("/api/auth/signout", {
		csrfToken,
		callbackUrl: redirectTo,
	});
	if (!response.ok) {
		window.location.assign(
			`/api/auth/signout?callbackUrl=${encodeURIComponent(redirectTo)}`,
		);
		return;
	}
	window.location.assign(redirectTo);
}
