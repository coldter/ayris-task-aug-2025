import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI } from "better-auth/plugins";
import { ac, roles } from "@/lib/permission";
import { db } from "../db";
import * as schema from "../db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    cookies: {
      session_token: {
        name: "session_token_v1",
        attributes: {
          httpOnly: true,
          secure: true,
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "tester",
        input: false,
      },
    },
  },
  plugins: [
    admin({
      ac: ac,
      roles: roles,
      adminRoles: ["superadmin"],
      defaultRole: "tester",
    }),
    openAPI({
      disableDefaultReference: true,
    }),
  ],
});
