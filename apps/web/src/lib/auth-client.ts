import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "server/src/lib/permission";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
  plugins: [
    adminClient({
      // biome-ignore lint/suspicious/noExplicitAny: <>
      ac: ac as any,
      roles: roles,
    }),
  ],
});
