import { db } from "../lib/db/client";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Applying Web3 track schema columns to tasks table...");
  try {
    await db.execute(sql.raw(`
      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "track" text DEFAULT 'main' NOT NULL;
      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "task_type" text;
      CREATE INDEX IF NOT EXISTS "tasks_track_idx" ON "tasks" ("track");
    `));
    console.log("✅ Successfully added 'track' and 'task_type' columns and index to 'tasks' table!");
  } catch (error) {
    console.error("❌ Error applying migration 0008:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
