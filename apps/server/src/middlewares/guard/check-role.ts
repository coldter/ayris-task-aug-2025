import { logger } from "better-auth";
import { createMiddleware } from "hono/factory";
import type { roleEnum } from "@/db/schema";
import type { Env } from "@/lib/context";

export const checkRole = ({
  role = ["tester"],
}: {
  role?: (typeof roleEnum)[number][];
} = {}) => {
  return createMiddleware<Env>(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json(
        {
          error: {
            message: "Unauthorized",
          },
        },
        401,
      );
    }

    if (!role.includes(user.role as (typeof roleEnum)[number])) {
      logger.error(
        `User ${user.id} with role ${user.role} tried to access ${role} only route`,
      );
      return c.json(
        {
          error: {
            message: "Forbidden",
            details: "User does not have access to this route",
          },
        },
        403,
      );
    }

    return next();
  });
};
