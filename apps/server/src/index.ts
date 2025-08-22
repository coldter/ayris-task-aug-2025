import "dotenv/config";
import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";
import { docs } from "@/lib/docs";
import { logger } from "@/lib/logger";
import { app } from "@/routers/main";

docs(app, process.env.ENABLE_DOCS === "true");
showRoutes(app, {
  colorize: true,
  // verbose: true,
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
    logger.info(`Server is running on http://localhost:${info.port}`);
  },
);
