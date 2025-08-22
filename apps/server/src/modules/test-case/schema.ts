import { z } from "@hono/zod-openapi";
import { supportUpdateEnum, testerUpdateEnum } from "@/db/schema";

export const getAllTestCasesGroupedByTestersResponseSchema = z.object({
  testers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      testCases: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          testerUpdate: z.enum(testerUpdateEnum),
          supportUpdate: z.enum(supportUpdateEnum),
        }),
      ),
    }),
  ),
});

export const createTestCaseRequestSchema = z.object({
  testerId: z.string().array().min(1),
  description: z.string(),
});

export const createTestCaseResponseSchema = z.object({
  id: z.string(),
  description: z.string(),
  testerId: z.string().array().min(1),
  testerUpdate: z.enum(testerUpdateEnum),
  supportUpdate: z.enum(supportUpdateEnum),
});
