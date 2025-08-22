import { OpenAPIHono } from "@hono/zod-openapi";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { Env } from "@/lib/context";
import testerRoutes from "@/modules/tester/routes";

const app = new OpenAPIHono<Env>();

const testerHandler = app.openapi(testerRoutes.getAllTesterInfo, async (c) => {
  const testers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(user.role, "tester"))
    .orderBy(desc(user.createdAt));

  return c.json({ testers: testers }, 200);
});

export default testerHandler;
