import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger as httpLogger } from "hono/logger";
import type { Env } from "@/lib/context";
import { handleError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { authContextMiddleware } from "@/middlewares/auth-context";

const baseApp = new OpenAPIHono<Env>();

baseApp.use(
  httpLogger((str, ...rest) => {
    logger.child({ label: "Http-Request" }).info(str, ...rest);
  }),
);

baseApp.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

baseApp.get("/ping", (c) => c.text("pong"));

baseApp.use(authContextMiddleware);

baseApp.notFound(() => {
  throw new HTTPException(404, {
    message: "Not Found",
  });
});
baseApp.onError(handleError);

export default baseApp;
