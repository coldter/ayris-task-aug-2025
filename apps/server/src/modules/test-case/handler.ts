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
import type {
  getAllTestCasesGroupedByTestersResponseSchema,
  getFullTestCaseDetailsByTestCaseIdResponseSchema,
} from "@/modules/test-case/schema";

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
    type TestCaseDetails = z.infer<
      typeof getFullTestCaseDetailsByTestCaseIdResponseSchema
    >;

    const [result] = await db
      .select({
        result: sql<TestCaseDetails>`
        json_build_object(
          'id', ${testCases.id},
          'title', ${testCases.title},
          'description', ${testCases.description},
          'testerUpdate', ${testCases.testerUpdate},
          'supportUpdate', ${testCases.supportUpdate},
          'createdAt', ${testCases.createdAt},
          'updatedAt', ${testCases.updatedAt},
          'createdBy', json_build_object(
            'id', ${user.id},
            'name', ${user.name},
            'email', ${user.email},
            'role', ${user.role}
          ),
          'assignedTesters', COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email,
                'role', u.role
              )
            )
            FROM test_case_assignments tca
            JOIN "user" u ON tca.tester_id = u.id
            WHERE tca.test_case_id = ${testCases.id}
            AND u.role = 'tester'),
            '[]'::json
          ),
          'transitionTimeline', COALESCE(
            (SELECT json_agg(
              json_build_object(
                'status', ttl.transition_status,
                'transitionAt', ttl.transition_at,
                'transitionBy', json_build_object(
                  'id', transition_user.id,
                  'name', transition_user.name,
                  'email', transition_user.email,
                  'role', transition_user.role
                ),
                'comment', ttl.transition_comment
              )
              ORDER BY ttl.transition_at ASC
            )
            FROM test_case_transition_logs ttl
            JOIN "user" transition_user ON ttl.transition_by = transition_user.id
            WHERE ttl.test_case_id = ${testCases.id}),
            '[]'::json
          )
        )
      `.as("result"),
      })
      .from(testCases)
      .innerJoin(user, eq(testCases.createdBy, user.id))
      .where(eq(testCases.id, testCaseId));

    if (!result?.result) {
      throw new HTTPException(404, {
        message: "Test case not found",
      });
    }

    return c.json(result.result, 200);
  });

export default testCaseHandler;
