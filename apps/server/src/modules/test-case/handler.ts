import { OpenAPIHono } from "@hono/zod-openapi";
import { db } from "@/db";
import {
  testCaseAssignments,
  testCases,
  testCaseTransitionLogs,
} from "@/db/schema";
import type { Env } from "@/lib/context";
import testCaseRoutes from "@/modules/test-case/routes";

const app = new OpenAPIHono<Env>();

const testCaseHandler = app
  .openapi(testCaseRoutes.getAllTestCasesGroupedByTesters, async (c) => {
    return c.json({ testCases: [] } as any, 200);
  })
  .openapi(testCaseRoutes.getAllTestCasesForTester, async (c) => {
    return c.json({ testCases: [] } as any);
  })
  .openapi(testCaseRoutes.createTestCase, async (c) => {
    const user = c.get("user")!;
    const { description, testerIds } = c.req.valid("json");

    const createdTestCase = await db.transaction(async (trx) => {
      const [testCase] = await trx
        .insert(testCases)
        .values({
          description,
          createdBy: user.id,
        })
        .returning()
        .execute();

      if (!testCase) {
        throw new Error("Failed to create test case");
      }
      await trx.insert(testCaseTransitionLogs).values({
        testCaseId: testCase.id,
        transitionBy: user.id,
        transitionStatus: "initiated",
        transitionAt: new Date(),
        transitionComment: `Created by ${user.name}`,
      });

      await trx.insert(testCaseAssignments).values(
        testerIds.map((testerId) => ({
          testCaseId: testCase.id,
          testerId,
        })),
      );

      return testCase;
    });

    return c.json({ ...createdTestCase }, 200);
  });

export default testCaseHandler;
