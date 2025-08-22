import authRouteHandler from "@/modules/auth/handler";
import testCaseHandler from "@/modules/test-case/handler";
import testerHandler from "@/modules/tester/handler";
import baseApp from "@/server";

export const app = baseApp
  .route("/api/auth", authRouteHandler)
  .route("/api/test-case", testCaseHandler)
  .route("/api/tester", testerHandler);
