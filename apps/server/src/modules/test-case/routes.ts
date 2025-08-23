import { z } from "@hono/zod-openapi";
import { commonErrorResponses } from "@/lib/common-resonse";
import { createRouteConfig } from "@/lib/route-config";
import { isAuthenticated } from "@/middlewares/guard";
import { checkRole } from "@/middlewares/guard/check-role";
import {
  createTestCaseRequestSchema,
  createTestCaseResponseSchema,
  editTestCaseByTestCaseIdRequestSchema,
  getAllTestCasesForTesterResponseSchema,
  getAllTestCasesGroupedByTestersResponseSchema,
  getFullTestCaseDetailsByTestCaseIdResponseSchema,
} from "@/modules/test-case/schema";

const testCaseRoutes = {
  getAllTestCasesAssignedToTester: createRouteConfig({
    operationId: "getAllTestCasesAssignedToTester",
    method: "get",
    path: "/assigned-to-me",
    guard: [isAuthenticated, checkRole({ role: ["tester"] })],
    tags: ["test-case"],
    summary: "Get all test cases assigned to the tester",
    description: "Returns all test cases assigned to the tester",
    request: {},
    responses: {
      200: {
        description: "Context entities",
        content: {
          "application/json": {
            schema: getAllTestCasesForTesterResponseSchema,
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

  getFullTestCaseDetailsByTestCaseId: createRouteConfig({
    operationId: "getFullTestCaseDetailsByTestCaseId",
    method: "get",
    path: "/{testCaseId}",
    guard: [
      isAuthenticated,
      checkRole({ role: ["superadmin", "support", "tester"] }),
    ],
    tags: ["test-case"],
    summary: "Get full test case details by test case id",
    description: "Returns full test case details by test case id",
    request: {
      params: z.object({
        testCaseId: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Context entities",
        content: {
          "application/json": {
            schema: getFullTestCaseDetailsByTestCaseIdResponseSchema,
          },
        },
      },
      ...commonErrorResponses,
    },
  }),

  editTestCaseByTestCaseId: createRouteConfig({
    operationId: "editTestCaseByTestCaseId",
    method: "patch",
    path: "/{testCaseId}",
    guard: [
      isAuthenticated,
      checkRole({ role: ["superadmin", "support", "tester"] }),
    ],
    tags: ["test-case"],
    summary: "Edit a test case by test case id and action",
    description:
      "Edit a test case by test case id and action. Action can be 'edit', 'support-update', 'tester-update'",
    request: {
      params: z.object({
        testCaseId: z.string(),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: editTestCaseByTestCaseIdRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Context entities",
        content: {
          "application/json": {
            schema: getFullTestCaseDetailsByTestCaseIdResponseSchema,
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
