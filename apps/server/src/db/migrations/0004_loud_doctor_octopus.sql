ALTER TABLE "test_case_assignments" ALTER COLUMN "test_case_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "test_case_transition_logs" ALTER COLUMN "test_case_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "test_cases" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "test_cases" ALTER COLUMN "id" SET DEFAULT generate_entity_id('TC', 5);