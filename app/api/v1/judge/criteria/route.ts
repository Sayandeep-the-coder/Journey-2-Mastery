import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const GET = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId");

  if (taskId) {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (task && Array.isArray(task.criteria) && task.criteria.length > 0) {
      return NextResponse.json({
        success: true,
        data: task.criteria,
        passingScore: task.passingScore,
      });
    }
  }

  const defaultCriteriaList = [
    { id: "codeQuality", name: "Code Quality", maxScore: 25, description: "Clean, readable, well-structured code" },
    { id: "functionality", name: "Functionality", maxScore: 25, description: "All requirements met and working" },
    { id: "documentation", name: "Documentation", maxScore: 15, description: "README, comments, and code documentation" },
    { id: "testing", name: "Testing", maxScore: 15, description: "Test coverage and test quality" },
    { id: "creativity", name: "Creativity", maxScore: 20, description: "Innovation, UX, and going above requirements" },
  ];
  return NextResponse.json({ success: true, data: defaultCriteriaList, passingScore: 50 });
});
