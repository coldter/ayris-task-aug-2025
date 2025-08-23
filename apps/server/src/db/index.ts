import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import {
  drizzle as drizzleNodePg,
  type NodePgClient,
} from "drizzle-orm/node-postgres";
import { logger } from "@/lib/logger";
import { DrizzleLogger } from "@/lib/logger-drizzle";
import * as schema from "./schema";

export const db =
  process.env.DATABASE_CONNECTOR !== "neon"
    ? drizzleNodePg({
        schema,
        logger:
          process.env.NODE_ENV === "development" ? new DrizzleLogger() : false,
        connection: {
          connectionString: process.env.DATABASE_URL,
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 30000,
          max: 10,
          min: 0,
        },
        casing: "snake_case",
      })
    : drizzleNeon({
        schema,
        logger:
          process.env.NODE_ENV === "development" ? new DrizzleLogger() : false,
        connection: {
          connectionString: process.env.DATABASE_URL,
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 30000,
        },
      });

export async function checkDbConnection(pool: NodePgClient): Promise<void> {
  const client = await pool.connect().catch((err) => {
    logger.error("Failed to connect to database");
    throw new Error("Failed to connect to database", { cause: err });
  });
  if (!client) {
    logger.error("Failed to connect to database");
    throw new Error("Failed to connect to database");
  }
  const res = await client.query("SELECT NOW()").catch((err) => {
    logger.error("Failed to connect to database");
    throw new Error("Failed to connect to database", { cause: err });
  });
  logger.info("Connected to database", { dbTime: res.rows[0].now });
  client.release(true);
}

await checkDbConnection(db.$client);
