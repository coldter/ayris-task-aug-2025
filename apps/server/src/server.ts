import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger as httpLogger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";
import { db } from "@/db";
import type { Env } from "@/lib/context";
import { handleError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { authContextMiddleware } from "@/middlewares/auth-context";

const baseApp = new OpenAPIHono<Env>();

baseApp.use(trimTrailingSlash());
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

baseApp.get("/ping", async (c) => {
  const dbResponse = await db.$client.query("SELECT 1 AS one");

  let isDbOk = false;
  if (dbResponse?.rows[0]?.one === 1) {
    isDbOk = true;
  }

  return c.json({
    message: `pong::dbStatus=${isDbOk ? "ok" : "error"}`,
    dbStatus: isDbOk,
  });
});

baseApp.use(authContextMiddleware);

baseApp.notFound(() => {
  throw new HTTPException(404, {
    message: "Not Found",
  });
});
baseApp.onError(handleError);

export default baseApp;
