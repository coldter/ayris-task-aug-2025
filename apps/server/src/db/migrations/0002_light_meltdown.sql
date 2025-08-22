ALTER TABLE "test_cases" ALTER COLUMN "id" SET DEFAULT generate_entity_id('TC', 5);--> statement-breakpoint
ALTER TABLE "test_cases" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "test_cases" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "test_cases" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "test_cases" ADD COLUMN "created_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "test_cases" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;