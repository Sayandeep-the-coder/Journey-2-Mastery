import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import { forbidden } from "@/lib/utils/apiError";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

export const GET = apiHandler(async (req: Request) => {
  const user = await requireAuth(req);
  if (user.role !== "admin") throw forbidden("Admin access required");

  let rows: Array<Record<string, unknown>> = [];
  try {
    rows = await db.execute(
      sql`SELECT user_id, username, full_name, rank, total_score, tasks_completed, leaderboard_rank
          FROM leaderboard
          ORDER BY total_score DESC, user_id ASC`
    ) as unknown as Array<Record<string, unknown>>;
  } catch {
    // Materialized view might not exist yet
    rows = [];
  }

  const header = "Rank,Username,Full Name,Tier,Score,Tasks Completed";
  const csvRows = rows.map((row) =>
    [
      row.leaderboard_rank,
      `"${(row.username as string || "").replace(/"/g, '""')}"`,
      `"${(row.full_name as string || "").replace(/"/g, '""')}"`,
      row.rank,
      row.total_score,
      row.tasks_completed,
    ].join(",")
  );

  const csv = [header, ...csvRows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leaderboard-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
});
