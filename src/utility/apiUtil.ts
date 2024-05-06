import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function validateParams<S extends z.ZodSchema>(
  params: unknown,
  schema: S
): Promise<z.infer<S> & { error?: string | null }> {
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const { path, message } = err.issues[0];
      return { error: `Error validating param '${path}': ${message}` };
    }
    return { error: "Invalid request parameters" };
  }
}

export async function handleNotFoundDbQuery<T>(data: T, notFoundMessage = "") {
  if (!data)
    return NextResponse.json(
      { error: notFoundMessage || "Resource not found" },
      { status: 404 }
    );
  return NextResponse.json(data);
}

const RouteWithIdSchema = z.object({ id: z.coerce.number() });

export function getMutationRouteWithId<T>(
  mutateData: (
    id: number,
    body: T extends z.AnyZodObject ? z.infer<T> : undefined
  ) => Promise<unknown>,
  bodySchema?: T extends z.AnyZodObject ? T : undefined
) {
  return auth(async (req, { params }) => {
    const { id, error } = await validateParams(params, RouteWithIdSchema);
    if (error) return NextResponse.json({ error }, { status: 400 });
    let body;
    if (bodySchema) {
      const bodyJson = await req.json();
      body = await validateParams(bodyJson, bodySchema);
    }
    try {
      await mutateData(id, body);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  });
}

export function getCreationRoute<T extends z.ZodSchema>(
  mutateData: (body: z.infer<T>) => Promise<unknown>,
  bodySchema: T
) {
  return auth(async (req) => {
    const bodyJson = await req.json();
    const validation = await validateParams(bodyJson, bodySchema);
    if (validation.error)
      return NextResponse.json({ error: validation.error }, { status: 400 });
    try {
      await mutateData(validation);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  });
}

export function getQueryRouteWithId(
  getData: (id: number) => Promise<unknown>,
  getNotFoundMessage = (id: number) => `Resource with id '${id}' does not exist`
) {
  return auth(async (_req, { params }) => {
    const validation = await validateParams(params, RouteWithIdSchema);
    if (validation.error)
      return NextResponse.json({ error: validation.error }, { status: 400 });
    return handleNotFoundDbQuery(
      await getData(validation.id),
      getNotFoundMessage(validation.id)
    );
  });
}
