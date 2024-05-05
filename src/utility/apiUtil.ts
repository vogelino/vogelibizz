import { isAuthenticatedAndAdmin } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function authenticatedRoute<
  T extends () => Promise<Response | NextResponse>
>(handler: T) {
  const authenticatedAndAdmin = await isAuthenticatedAndAdmin();
  if (!authenticatedAndAdmin) return () => NextResponse.redirect("/login");
  return handler();
}

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

export const RouteWithIdSchema = z.object({ id: z.coerce.number() });

export async function handleNotFoundDbQuery<T>(data: T, notFoundMessage = "") {
  if (!data)
    return NextResponse.json(
      { error: notFoundMessage || "Resource not found" },
      { status: 404 }
    );
  return NextResponse.json(data);
}

export function getRouteWithId(
  getData: (id: number) => Promise<unknown>,
  getNotFoundMessage = (id: number) => `Resource with id '${id}' does not exist`
) {
  return async (_req: Request, { params }: { params: unknown }) =>
    authenticatedRoute(async () => {
      const { id, error } = await validateParams(params, RouteWithIdSchema);
      if (error) return NextResponse.json({ error }, { status: 400 });
      return handleNotFoundDbQuery(await getData(id), getNotFoundMessage(id));
    });
}
