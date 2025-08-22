import { z } from "@hono/zod-openapi";

export const getAllTesterInfoResponseSchema = z.object({
  testers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    }),
  ),
});
