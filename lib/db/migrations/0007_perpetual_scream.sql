ALTER TABLE "tasks" ADD COLUMN "criteria" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "passing_score" integer DEFAULT 50 NOT NULL;