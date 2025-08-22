import { pgTable, primaryKey, text, varchar } from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";

export const testerUpdateEnum = ["pending", "complete"] as const;
export const supportUpdateEnum = [
  "passed",
  "failed",
  "complete",
  "retest",
  "na",
  "pending_validation",
] as const;

export const testCases = pgTable("test_cases", {
  id: text("id").primaryKey(),
  description: varchar("description", { length: 256 }),
  testerUpdate: varchar("tester_update", {
    enum: testerUpdateEnum,
  })
    .default("pending")
    .notNull(),
  supportUpdate: varchar("support_update", {
    enum: supportUpdateEnum,
  })
    .default("pending_validation")
    .notNull(),
});

export const testCaseAssignments = pgTable(
  "test_case_assignments",
  {
    testCaseId: text("test_case_id")
      .notNull()
      .references(() => testCases.id, { onDelete: "cascade" }),
    testerId: text("tester_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.testCaseId, t.testerId] })],
);
