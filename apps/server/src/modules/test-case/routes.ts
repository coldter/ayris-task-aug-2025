import { commonErrorResponses } from "@/lib/common-resonse";
import { createRouteConfig } from "@/lib/route-config";
import { isAuthenticated } from "@/middlewares/guard";
import { checkRole } from "@/middlewares/guard/check-role";
import {
  createTestCaseRequestSchema,
  createTestCaseResponseSchema,
  getAllTestCasesGroupedByTestersResponseSchema,
} from "@/modules/test-case/schema";

const testCaseRoutes = {
  getAllTestCasesForTester: createRouteConfig({
    operationId: "getAllTestCasesForTester",
    method: "get",
    path: "/",
    guard: [isAuthenticated, checkRole({ role: ["tester"] })],
    tags: ["test-case"],
    summary: "Get all test cases for a tester",
    description: "Returns all test cases for a tester",
    request: {},
    responses: {
      200: {
        description: "Context entities",
        content: {
          "application/json": {
            schema: getAllTestCasesGroupedByTestersResponseSchema,
          },
        },
      },
      ...commonErrorResponses,
    },
  }),
  getAllTestCasesGroupedByTesters: createRouteConfig({
    operationId: "getAllTestCasesGroupedByTesters",
    method: "get",
    path: "/",
    guard: [isAuthenticated, checkRole({ role: ["superadmin", "support"] })],
    tags: ["test-case"],
    summary: "Get all test cases grouped by testers",
    description: "Returns all test cases grouped by testers",
    request: {},
    responses: {
      200: {
        description: "Context entities",
        content: {
          "application/json": {
            schema: getAllTestCasesGroupedByTestersResponseSchema,
          },
        },
      },
      ...commonErrorResponses,
    },
  }),

  createTestCase: createRouteConfig({
    operationId: "createTestCase",
    method: "post",
    path: "/",
    guard: [isAuthenticated, checkRole({ role: ["superadmin", "support"] })],
    tags: ["test-case"],
    summary: "Create a test case",
    description: "Creates a new test case",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: createTestCaseRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Context entities",
        content: {
          "application/json": {
            schema: createTestCaseResponseSchema,
          },
        },
      },
      ...commonErrorResponses,
    },
  }),
};

export default testCaseRoutes;
