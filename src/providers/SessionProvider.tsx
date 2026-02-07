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
		setStatus("unauthenticated");
		setSession(null);
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
}: {
	redirectTo?: string;
} = {}) {
	if (typeof window !== "undefined") {
		window.location.assign(redirectTo);
	}
}

export function signOut({
	redirectTo = "/login",
}: {
	redirectTo?: string;
} = {}) {
	if (typeof window !== "undefined") {
		window.location.assign(redirectTo);
	}
}
