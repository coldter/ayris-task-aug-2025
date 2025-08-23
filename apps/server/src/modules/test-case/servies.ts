import type { z } from "@hono/zod-openapi";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { testCases, user } from "@/db/schema";
import type { getFullTestCaseDetailsByTestCaseIdResponseSchema } from "@/modules/test-case/schema";

export async function getTestCaseFullDetail(id: string) {
  type TestCaseDetails = z.infer<
    typeof getFullTestCaseDetailsByTestCaseIdResponseSchema
  >;
  return await db
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
    .where(eq(testCases.id, id));
}
