import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import { db } from "@/lib/db/client";
import { submissions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, forbidden } from "@/lib/utils/apiError";
import { getPreviousJudgedSubmissions } from "@/lib/services/judge.service";

export const GET = apiHandler(
  async (req: Request, { params }: { params: Promise<{ submissionId: string }> }) => {
    const user = await requireAuth(req);
    const { submissionId } = await params;

    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
      with: { user: true },
    });

    if (!submission) {
      throw notFound("Submission", submissionId);
    }

    // Auth check: admin, judge, or author/team member
    if (user.role !== "admin" && user.role !== "judge") {
      const isAuthor = submission.userId === user.id;

      let isTeamMember = false;
      if (submission.teamId) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id),
          columns: { currentTeamId: true },
        });
        isTeamMember = !!(dbUser?.currentTeamId && submission.teamId === dbUser.currentTeamId);
      }

      if (!isAuthor && !isTeamMember) {
        throw forbidden("You are not authorized to view this submission history");
      }
    }

    const history = await getPreviousJudgedSubmissions(
      submission.id,
      submission.userId,
      submission.teamId,
      submission.taskId
    );

    return NextResponse.json({
      success: true,
      data: history,
    });
  }
);
