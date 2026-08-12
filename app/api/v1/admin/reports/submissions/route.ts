import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import { forbidden } from "@/lib/utils/apiError";
import { db } from "@/lib/db/client";
import { submissions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const GET = apiHandler(async (req: Request) => {
  const user = await requireAuth(req);
  if (user.role !== "admin") throw forbidden("Admin access required");

  const allSubmissions = await db.query.submissions.findMany({
    with: {
      user: { columns: { username: true, fullName: true } },
      task: { columns: { title: true, category: true, difficulty: true } },
      review: { columns: { totalScore: true, feedback: true } },
    },
    orderBy: [desc(submissions.submittedAt)],
  });

  const header = "Submission ID,Username,Full Name,Task,Category,Difficulty,Status,Score,Repo URL,Submitted At";
  const csvRows = allSubmissions.map((s) =>
    [
      s.id,
      `"${(s.user?.username || "").replace(/"/g, '""')}"`,
      `"${(s.user?.fullName || "").replace(/"/g, '""')}"`,
      `"${(s.task?.title || "").replace(/"/g, '""')}"`,
      s.task?.category || "",
      s.task?.difficulty || "",
      s.status,
      s.review?.totalScore ?? "",
      `"${s.repoUrl}"`,
      s.submittedAt ? new Date(s.submittedAt).toISOString() : "",
    ].join(",")
  );

  const csv = [header, ...csvRows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="submissions-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
});
