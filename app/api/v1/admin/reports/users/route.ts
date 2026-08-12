import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import { forbidden } from "@/lib/utils/apiError";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const GET = apiHandler(async (req: Request) => {
  const user = await requireAuth(req);
  if (user.role !== "admin") throw forbidden("Admin access required");

  const allUsers = await db
    .select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      rank: users.rank,
      score: users.score,
      collegeName: users.collegeName,
      branch: users.branch,
      year: users.year,
      isActive: users.isActive,
      isProfileComplete: users.isProfileComplete,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const header = "User ID,Username,Full Name,Email,Role,Rank,Score,College,Branch,Year,Active,Profile Complete,Joined At";
  const csvRows = allUsers.map((u) =>
    [
      u.id,
      `"${(u.username || "").replace(/"/g, '""')}"`,
      `"${(u.fullName || "").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      u.role,
      u.rank,
      u.score,
      `"${(u.collegeName || "").replace(/"/g, '""')}"`,
      `"${(u.branch || "").replace(/"/g, '""')}"`,
      u.year || "",
      u.isActive ? "Yes" : "No",
      u.isProfileComplete ? "Yes" : "No",
      u.createdAt ? new Date(u.createdAt).toISOString() : "",
    ].join(",")
  );

  const csv = [header, ...csvRows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="users-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
});
