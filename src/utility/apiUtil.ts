import { auth } from "@/auth";
import { parseId } from "@/utility/resourceUtil";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ActionType } from "./data/createQueryFunction";

async function validateParams(
  params: unknown
): Promise<{ id: number; error: null } | { id?: undefined; error: string }> {
  const idSchema = z.union([z.string(), z.number()]);
  const idTest = idSchema.safeParse(params);
  if (idTest.success) return { id: parseId(idTest.data), error: null };
  const objTest = z.object({ id: idSchema }).safeParse(params);
  if (objTest.error) {
    console.log(`Missing ID in params object`, objTest.error);
    return { error: `Missing ID in params object` };
  }
  return { id: parseId(objTest.data.id), error: null };
}

async function validateBody<
  InputType extends { id: number | string },
  InputSchema extends z.ZodSchema<InputType>
>(
  body: unknown,
  schema: InputSchema
): Promise<
  { body: InputType; error: null } | { body?: undefined; error: string }
> {
  const { id, error } = await validateParams(body);
  if (error || !id) return { error: error || "Missing ID in body" };
  const bodyIsObject = z.object({}).safeParse(body);
  if (bodyIsObject.error) {
    console.log(`Body is not an object`, bodyIsObject.error);
    return { error: "Body is not an object" };
  }
  const parsedBody = schema.safeParse({ ...bodyIsObject.data, id });
  if (parsedBody.error) {
    console.log(`Invalid body`, parsedBody.error.message);
    return { error: "Invalid body" };
  }
  return { body: parsedBody.data, error: null };
}

export async function handleNotFoundDbQuery<T>(data: T, notFoundMessage = "") {
  if (!data)
    return NextResponse.json(
      { error: notFoundMessage || "Resource not found" },
      { status: 404 }
    );
  return NextResponse.json(data);
}

export function getEditionRoute(
  mutateData: (inputId: number, body?: unknown) => Promise<unknown>
) {
  return auth(async (req, { params = {} }) => {
    let body = {};
    try {
      body = await req.json();
      body = z.object({}).passthrough().parse(body);
    } catch (err) {
      return handleError(err, "edit");
    }
    const validation = await validateParams(params);
    if (validation.error || !validation.id)
      return NextResponse.json(
        { error: validation.error },
        { status: 400, statusText: "Invalid Parameters" }
      );
    const id = validation.id;
    try {
      console.log(`–––––––––––––––––––––––––`);
      console.log(`Mutating using the id and body`);
      console.log(`–––––––––––––––––––––––––`);
      await mutateData(id, body);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      return handleError(err, "edit");
    }
  });
}

export function getDeletionRoute(mutateData: (id: number) => Promise<unknown>) {
  return auth(async (_req, { params = {} }) => {
    const { id, error } = await validateParams(params);
    if (error || !id)
      return NextResponse.json(
        { error },
        { status: 400, statusText: error || "Missing ID in params" }
      );
    try {
      await mutateData(id);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      return handleError(err, "delete");
    }
  });
}

export function getCreationRoute<T extends z.ZodSchema>(
  mutateData: (body: z.infer<T>) => Promise<unknown>
) {
  return auth(async (req) => {
    try {
      const bodyJson = await req.json();
      await mutateData(bodyJson);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      return handleError(err, "create");
    }
  });
}

export function getQueryRouteWithId(
  getData: (id: number) => Promise<unknown>,
  getNotFoundMessage = (id: number | string) =>
    `Resource with id '${id}' does not exist`
) {
  return auth(async (_req, { params }) => {
    const validation = await validateParams(params);
    if (validation.error || !validation.id)
      return NextResponse.json(
        { error: validation.error || "Missing ID" },
        { status: 400 }
      );
    return handleNotFoundDbQuery(
      await getData(parseId(validation.id)),
      getNotFoundMessage(validation.id)
    );
  });
}

function handleError(err: unknown, action: ActionType) {
  console.log(`–––––––––––––––––––––––––`);
  console.log(`Error in the ${action} route`);
  if (err instanceof z.ZodError) {
    const joinedIssues = err.issues
      .map(({ message, path }) => `- ${path}: ${message}`)
      .join("\n");
    console.log(joinedIssues);
    console.log(`–––––––––––––––––––––––––`);
    return NextResponse.json(
      { error: joinedIssues },
      { status: 400, statusText: "Invalid body" }
    );
  }
  console.log(err);
  console.log(`–––––––––––––––––––––––––`);
  return NextResponse.json({ error: err }, { status: 500 });
}

export default {};
