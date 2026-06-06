import type { RequestHandler } from "@tanstack/react-start/server";
import {
	createStartHandler,
	defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";
import type { D1Env } from "@/db/d1Types";

const handler = createStartHandler(defaultStreamHandler);

const fetch = ((request: Request, env?: D1Env, ctx?: unknown) => {
	(globalThis as { __START_ENV__?: D1Env }).__START_ENV__ = env;
	return handler(request, { context: { env, ctx } });
}) as unknown as RequestHandler;

export default createServerEntry({
	fetch,
});
