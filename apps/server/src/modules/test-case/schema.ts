import { z } from "@hono/zod-openapi";
import {
  supportUpdateEnum,
  testCaseTransitionStatusEnum,
  testerUpdateEnum,
} from "@/db/schema/application-schema";
import { roleEnum } from "@/db/schema/auth";

export const getAllTestCasesGroupedByTestersResponseSchema = z.object({
  testers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      testCases: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          testerUpdate: z.enum(testerUpdateEnum),
          supportUpdate: z.enum(supportUpdateEnum),
        }),
      ),
    }),
  ),
});

export const createTestCaseRequestSchema = z.object({
  title: z.string(),
  testerIds: z.string().array().min(1),
  description: z.string(),
});

export const createTestCaseResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  testerUpdate: z.enum(testerUpdateEnum),
  supportUpdate: z.enum(supportUpdateEnum),
});

export const getAllTestCasesForTesterResponseSchema = z.object({
  testCases: z.array(createTestCaseResponseSchema),
});

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(roleEnum),
});

// Transition timeline entry schema
const transitionTimelineEntrySchema = z.object({
  status: z.enum(testCaseTransitionStatusEnum),
  transitionAt: z.iso.datetime(),
  transitionBy: userSchema,
  comment: z.string().optional(),
});

export const getFullTestCaseDetailsByTestCaseIdResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  testerUpdate: z.enum(testerUpdateEnum),
  supportUpdate: z.enum(supportUpdateEnum),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  createdBy: userSchema,
  assignedTesters: z.array(userSchema),
  transitionTimeline: z.array(transitionTimelineEntrySchema),
});

export const editTestCaseByTestCaseIdRequestSchema = z.discriminatedUnion(
  "action",
  [
    z.object({
      action: z.literal("edit"),
      title: z.string(),
      description: z.string(),
      supportUpdate: z.enum(supportUpdateEnum).optional(),
    }),
    z.object({
      action: z.literal("support-update"),
      supportUpdate: z.enum(supportUpdateEnum),
    }),
    z.object({
      action: z.literal("tester-update"),
      testerUpdate: z.enum(testerUpdateEnum),
    }),
  ],
);
