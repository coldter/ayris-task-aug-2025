import { OpenAPIHono, type z } from "@hono/zod-openapi";
import { sentenceCase } from "change-case";
import { and, asc, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
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
import { getTestCaseFullDetail } from "@/modules/test-case/servies";

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
  })
  .openapi(testCaseRoutes.getFullTestCaseDetailsByTestCaseId, async (c) => {
    const { testCaseId } = c.req.valid("param");

    if (c.get("user")?.role === "tester") {
      // check if the tester is assigned to the test case
      const isAssigned = await db.$count(
        testCaseAssignments,
        and(
          eq(testCaseAssignments.testCaseId, testCaseId),
          eq(testCaseAssignments.testerId, c.get("user")!.id),
        ),
      );

      if (!isAssigned) {
        return c.json(
          {
            error: {
              message: "You are not assigned to this test case",
            },
          },
          403,
        );
      }
    }

    const [result] = await getTestCaseFullDetail(testCaseId);

    if (!result?.result) {
      throw new HTTPException(404, {
        message: "Test case not found",
      });
    }

    return c.json(result.result, 200);
  })
  .openapi(testCaseRoutes.editTestCaseByTestCaseId, async (c) => {
    const user = c.get("user")!;
    const { testCaseId } = c.req.valid("param");
    const body = c.req.valid("json");

    if (user.role === "tester") {
      if (body.action !== "tester-update") {
        throw new HTTPException(403, {
          message: "You are not authorized to edit this test case",
        });
      }
      const isAssigned = await db.$count(
        testCaseAssignments,
        and(
          eq(testCaseAssignments.testCaseId, testCaseId),
          eq(testCaseAssignments.testerId, c.get("user")!.id),
        ),
      );

      if (!isAssigned) {
        throw new HTTPException(403, {
          message: "You are not assigned to this test case",
        });
      }
    }

    const isExists = await db.$count(testCases, eq(testCases.id, testCaseId));

    if (!isExists) {
      throw new HTTPException(404, {
        message: "Test case not found",
      });
    }

    await db.transaction(async (trx) => {
      switch (body.action) {
        case "edit": {
          const { title, description, supportUpdate } = body;
          await trx
            .update(testCases)
            .set({
              title: sentenceCase(title),
              description,
              supportUpdate,
            })
            .where(eq(testCases.id, testCaseId));

          await trx.insert(testCaseTransitionLogs).values({
            testCaseId,
            transitionBy: user.id,
            transitionStatus: "edited",
            transitionAt: new Date(),
            transitionComment: `Edited by ${user.name}`,
          });

          if (supportUpdate) {
            await trx.insert(testCaseTransitionLogs).values({
              testCaseId,
              transitionBy: user.id,
              transitionStatus: supportUpdate,
              transitionAt: new Date(),
              transitionComment: `Support update by ${user.name} to ${supportUpdate}`,
            });
          }
          break;
        }
        case "support-update": {
          const { supportUpdate } = body;
          await trx
            .update(testCases)
            .set({
              supportUpdate,
              testerUpdate: supportUpdate === "retest" ? "pending" : undefined,
            })
            .where(eq(testCases.id, testCaseId));

          await trx.insert(testCaseTransitionLogs).values({
            testCaseId,
            transitionBy: user.id,
            transitionStatus: supportUpdate,
            transitionAt: new Date(),
            transitionComment: `Support update by ${user.name} to ${supportUpdate}`,
          });
          break;
        }
        case "tester-update": {
          const { testerUpdate } = body;
          await trx
            .update(testCases)
            .set({
              testerUpdate,
            })
            .where(eq(testCases.id, testCaseId));

          await trx.insert(testCaseTransitionLogs).values({
            testCaseId,
            transitionBy: user.id,
            transitionStatus: testerUpdate,
            transitionAt: new Date(),
            transitionComment: `Tester update by ${user.name} to ${testerUpdate}`,
          });
          break;
        }
      }
    });

    const [result] = await getTestCaseFullDetail(testCaseId);

    if (!result?.result) {
      throw new HTTPException(404, {
        message: "Test case not found",
      });
    }

    return c.json(result.result, 200);
  });

export default testCaseHandler;
