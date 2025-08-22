import { OpenAPIHono, type z } from "@hono/zod-openapi";
import { sentenceCase } from "change-case";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  testCaseAssignments,
  testCases,
  testCaseTransitionLogs,
  user,
} from "@/db/schema";
import type { Env } from "@/lib/context";
import testCaseRoutes from "@/modules/test-case/routes";
import type { getAllTestCasesGroupedByTestersResponseSchema } from "@/modules/test-case/schema";

const app = new OpenAPIHono<Env>();

const testCaseHandler = app
  .openapi(testCaseRoutes.getAllTestCasesGroupedByTesters, async (c) => {
    type TestCase = z.infer<
      typeof getAllTestCasesGroupedByTestersResponseSchema
    >["testers"][number]["testCases"];

    const result = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        testCases: sql<TestCase>`
      coalesce(
        json_agg(
          json_build_object(
            'id', ${testCases.id},
            'title', ${testCases.title},
            'testerUpdate', ${testCases.testerUpdate},
            'supportUpdate', ${testCases.supportUpdate}
          )
        ) FILTER (WHERE ${testCases.id} IS NOT NULL),
        '[]'::json
      )
    `.as("test_cases"),
      })
      .from(user)
      .leftJoin(testCaseAssignments, eq(user.id, testCaseAssignments.testerId))
      .leftJoin(testCases, eq(testCaseAssignments.testCaseId, testCases.id))
      .where(eq(user.role, "tester"))
      .groupBy(user.id, user.name, user.email)
      .orderBy(asc(user.createdAt));

    return c.json({ testers: result }, 200);
  })
  .openapi(testCaseRoutes.getAllTestCasesAssignedToTester, async (c) => {
    const reqUser = c.get("user")!;
    const result = await db
      .select({
        id: testCases.id,
        title: testCases.title,
        createdAt: testCases.createdAt,
        supportUpdate: testCases.supportUpdate,
        testerUpdate: testCases.testerUpdate,
      })
      .from(testCases)
      .innerJoin(
        testCaseAssignments,
        eq(testCases.id, testCaseAssignments.testCaseId),
      )
      .innerJoin(user, eq(testCaseAssignments.testerId, reqUser.id))
      .where(eq(user.id, reqUser.id));

    return c.json(
      {
        testCases: result,
      },
      200,
    );
  })
  .openapi(testCaseRoutes.createTestCase, async (c) => {
    const user = c.get("user")!;
    const { description, testerIds, title } = c.req.valid("json");

    const createdTestCase = await db.transaction(async (trx) => {
      const [testCase] = await trx
        .insert(testCases)
        .values({
          title: sentenceCase(title),
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
