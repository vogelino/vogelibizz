import { z } from "zod";

export function createEditSchema<T>(schema: T) {
  if (!(schema instanceof z.ZodObject)) {
    throw new Error("schema must be an instance of z.ZodObject");
  }
  return schema
    .omit({
      created_at: true,
      last_modified: true,
    })
    .merge(
      z.object({
        last_modified: z
          .string()
          .optional()
          .default(() => new Date().toISOString()),
      })
    );
}
