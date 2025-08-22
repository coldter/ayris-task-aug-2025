CREATE TABLE "test_case_transition_logs" (
	"test_case_id" text NOT NULL,
	"transition_status" varchar NOT NULL,
	"transition_at" timestamp NOT NULL,
	"transition_by" text NOT NULL,
	"transition_comment" text
);
--> statement-breakpoint
ALTER TABLE "test_case_transition_logs" ADD CONSTRAINT "test_case_transition_logs_test_case_id_test_cases_id_fk" FOREIGN KEY ("test_case_id") REFERENCES "public"."test_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_case_transition_logs" ADD CONSTRAINT "test_case_transition_logs_transition_by_user_id_fk" FOREIGN KEY ("transition_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "test_case_transition_logs_test_case_id_index" ON "test_case_transition_logs" USING btree ("test_case_id");