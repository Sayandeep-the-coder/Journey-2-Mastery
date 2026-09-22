ALTER TABLE "tasks" ADD COLUMN "track" text DEFAULT 'main' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "task_type" text;--> statement-breakpoint
CREATE INDEX "tasks_track_idx" ON "tasks" USING btree ("track");
