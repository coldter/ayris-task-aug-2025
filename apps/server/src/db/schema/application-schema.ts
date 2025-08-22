import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
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
  id: text("id").primaryKey().default(sql`generate_entity_id('TC', 5)`),
  description: text("description").notNull(),
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
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const testCaseTransitionLogs = pgTable(
  "test_case_transition_logs",
  {
    testCaseId: text("test_case_id")
      .notNull()
      .references(() => testCases.id, { onDelete: "cascade" }),
    transitionStatus: varchar("transition_status", {
      enum: [...testerUpdateEnum, ...supportUpdateEnum],
    }).notNull(),
    transitionAt: timestamp("transition_at")
      .$defaultFn(() => new Date())
      .notNull(),
    transitionBy: text("transition_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    transitionComment: text("transition_comment"),
  },
  (t) => [
    index("test_case_transition_logs_test_case_id_index").on(t.testCaseId),
  ],
);

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
