import { commonErrorResponses } from "@/lib/common-resonse";
import { createRouteConfig } from "@/lib/route-config";
import { isAuthenticated } from "@/middlewares/guard";
import { checkRole } from "@/middlewares/guard/check-role";
import { getAllTesterInfoResponseSchema } from "@/modules/tester/schema";

const testerRoutes = {
  getAllTesterInfo: createRouteConfig({
    operationId: "getAllTesterInfo",
    method: "get",
    path: "/short-info-list",
    guard: [isAuthenticated, checkRole({ role: ["superadmin", "support"] })],
    tags: ["tester"],
    summary: "Get all tester information",
    description: "Returns all testers with their information and statistics",
    request: {},
    responses: {
      200: {
        description: "Tester information",
        content: {
          "application/json": {
            schema: getAllTesterInfoResponseSchema,
          },
        },
      },
      ...commonErrorResponses,
    },
  }),
};

export default testerRoutes;
