import type { Register } from "@tanstack/react-router";
import type { RequestHandler } from "@tanstack/react-start/server";
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import type { D1Env } from "./src/db/d1Types";

const handler = createStartHandler(defaultStreamHandler);

const fetch = ((request: Request, env?: D1Env, ctx?: unknown) => {
  (globalThis as { __START_ENV__?: D1Env }).__START_ENV__ = env;
  return handler(request, { context: { env, ctx } } as Parameters<typeof handler>[1]);
}) as unknown as RequestHandler<Register>;

export default { fetch };
