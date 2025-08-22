import type { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { auth } from "@/lib/auth";
import type { Env } from "@/lib/context";

const customCss: string = `
`;

export const docs = (app: OpenAPIHono<Env>, enable: boolean) => {
  if (!enable) {
    return;
  }
  const registry = app.openAPIRegistry;

  // Set security schemes
  registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "session_token_v1",
    description:
      "Authentication cookie. Copy the cookie from your network tab and paste it here. If you don't have it, you need to sign in or sign up first.",
  });

  app.doc31("/openapi.json", {
    servers: [{ url: "http://localhost:3100" }],
    info: {
      title: "Api Reference",
      version: "v1",
    },
    openapi: "3.1.0",
  });

  app.get("/docs", (c) => {
    return Scalar<Env>({
      url: "openapi.json",
      theme: "deepSpace",
      customCss: customCss,
      servers: [
        {
          url: `${c.req.url.replace(/\/docs*$/, "")}`,
          description: "Current",
        },
        {
          url: "http://localhost:3000",
          description: "Localhost",
        },
        {
          url: "{CUSTOM_URL}",
          description: "Custom",
          variables: {
            CUSTOM_URL: {
              default: "http://localhost:3000",
            },
          },
        },
      ],
    })(c, async () => {});
  });

  app.get("/docs/auth", async (c) => {
    const authSchema = await auth.api.generateOpenAPISchema();
    return Scalar<Env>({
      content: authSchema,
      theme: "deepSpace",
      customCss: customCss,
      servers: [
        {
          url: `${c.req.url.replace(/\/docs\/auth*$/, "/api/auth")}`,
          description: "Current",
        },
        {
          url: "http://localhost:3000/api/auth",
          description: "Localhost",
        },
        {
          url: "{CUSTOM_URL}",
          description: "Custom",
          variables: {
            CUSTOM_URL: {
              default: "http://localhost:3000/api/auth",
            },
          },
        },
      ],
    })(c, async () => {});
  });
};
