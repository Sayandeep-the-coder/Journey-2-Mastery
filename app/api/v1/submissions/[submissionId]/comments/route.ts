import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as commentService from "@/lib/services/comment.service";
import { db } from "@/lib/db/client";
import { submissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "@/lib/utils/apiError";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ submissionId: string }> }) => {
  await requireAuth(req);
  const { submissionId } = await params;

  // Check if submission exists
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) throw notFound("Submission", submissionId);

  const data = await commentService.getComments(submissionId);
  return NextResponse.json({ success: true, data });
});

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ submissionId: string }> }) => {
  const user = await requireAuth(req);
  const { submissionId } = await params;
  const body = await req.json();

  if (!body.content || typeof body.content !== "string") {
    return NextResponse.json({ success: false, error: { message: "Content is required" } }, { status: 400 });
  }

  // Check if submission exists
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) throw notFound("Submission", submissionId);

  const newComment = await commentService.createComment({
    submissionId,
    authorId: user.id,
    message: body.content,
  });

  return NextResponse.json({ success: true, data: newComment }, { status: 201 });
});
