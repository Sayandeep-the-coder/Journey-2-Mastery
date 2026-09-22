import { db } from "../lib/db/client";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Applying views.sql to convert leaderboard to a live view...");
  try {
    // Clean up: drop whatever form currently exists
    // (could be a regular view from a previous run, or a materialized view)
    try {
      await db.execute(sql.raw("DROP VIEW IF EXISTS leaderboard CASCADE;"));
      console.log("  Dropped existing VIEW (if any).");
    } catch { /* ignore */ }

    try {
      await db.execute(sql.raw("DROP MATERIALIZED VIEW IF EXISTS leaderboard CASCADE;"));
      console.log("  Dropped existing MATERIALIZED VIEW (if any).");
    } catch { /* ignore */ }

    // Now read and apply the views.sql, but skip the DROP lines since we already handled them
    const viewsSql = fs.readFileSync(path.join(__dirname, "../lib/db/views.sql"), "utf-8");
    const cleanedSql = viewsSql
      .replace(/DROP MATERIALIZED VIEW IF EXISTS leaderboard;/g, "-- (already dropped)")
      .replace(/DROP VIEW IF EXISTS leaderboard;/g, "-- (already dropped)");
    
    await db.execute(sql.raw(cleanedSql));
    console.log("✅ views.sql successfully applied — leaderboard is now live!");
  } catch (error) {
    console.error("❌ Error applying views:", error);
  } finally {
    process.exit(0);
  }
}

main();
