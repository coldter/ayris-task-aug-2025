import { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "@/lib/context";
import testCaseRoutes from "@/modules/test-case/routes";

const app = new OpenAPIHono<Env>();

const testCaseHandler = app
  .openapi(testCaseRoutes.getAllTestCasesGroupedByTesters, async (c) => {
    return c.json({ testCases: [] } as any);
  })
  .openapi(testCaseRoutes.createTestCase, async (c) => {
    return c.json({ testCase: [] } as any);
  });

export default testCaseHandler;
