import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "server/src/lib/permission";

const parsedUrl = new URL(import.meta.env.VITE_SERVER_URL);
const pathname = parsedUrl.pathname;
export const authClient = createAuthClient({
  baseURL: parsedUrl.origin,
  basePath: pathname !== "/" ? `${pathname}/api/auth` : "/api/auth",
  plugins: [
    adminClient({
      // biome-ignore lint/suspicious/noExplicitAny: <>
      ac: ac as any,
      roles: roles,
    }),
  ],
});
