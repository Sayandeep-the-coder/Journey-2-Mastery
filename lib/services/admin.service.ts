import { eq, and, gt, asc, desc, count, sql, ilike, or, inArray } from "drizzle-orm";
import { db } from "../db/client";
import {
  users,
  tasks,
  submissions,
  reviews,
  auditLog,
  communityPosts,
  teams,
} from "../db/schema";
import { notFound, badRequest } from "../utils/apiError";
import { reassignSubmission, computeJudgeLoadScore } from "./assignment.service";
import { AUDIT_ACTIONS, NOTIFICATION_TYPES } from "../utils/constants";
import { checkAndPromoteUser, syncUserScore, syncTeamScore } from "./user.service";
import { env } from "../config/env";
import { enrichReviewWithScores } from "./judge.service";
import { createNotification } from "./notification.service";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateUserInput,
  ChangeRoleInput,
  ManualAssignInput,
  OverrideReviewInput,
  CreatePostInput,
  UpdatePostInput,
} from "../validators/admin.validator";

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export async function getDashboard() {
  const [userCount] = await db.select({ count: count() }).from(users);
  const [judgeCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "judge"));
  const [taskCount] = await db.select({ count: count() }).from(tasks);
  const [teamCount] = await db.select({ count: count() }).from(teams);

  const statusCounts = await db
    .select({
      status: submissions.status,
      count: count(),
    })
    .from(submissions)
    .groupBy(submissions.status);

  return {
    totalUsers: userCount?.count ?? 0,
    totalJudges: judgeCount?.count ?? 0,
    totalTasks: taskCount?.count ?? 0,
    totalTeams: teamCount?.count ?? 0,
    submissionsByStatus: Object.fromEntries(
      statusCounts.map((r) => [r.status, r.count])
    ),
  };
}

export async function getActivityFeed(cursor?: string, limit = 20) {
  const conditions = [];
  if (cursor) conditions.push(gt(auditLog.id, cursor));

  const result = await db.query.auditLog.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      actor: { columns: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: [desc(auditLog.createdAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

// ──────────────────────────────────────────────
// User Management
// ──────────────────────────────────────────────

export async function getUsers(
  filters: { role?: string; rank?: string; search?: string; page?: number; limit?: number } = {}
) {
  const limit = filters.limit ?? 20;
  const page = filters.page ?? 1;
  const offset = (page - 1) * limit;
  const conditions = [];

  if (filters.role) conditions.push(eq(users.role, filters.role as "admin" | "judge" | "user"));
  if (filters.rank) conditions.push(eq(users.rank, filters.rank as "Ronin" | "Kenshi" | "Samurai" | "Shogun"));
  if (filters.search) conditions.push(or(ilike(users.username, `%${filters.search}%`), ilike(users.email, `%${filters.search}%`)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalCountResult] = await db
    .select({ count: count() })
    .from(users)
    .where(whereClause);
  const total = totalCountResult?.count ?? 0;

  const result = await db.query.users.findMany({
    where: whereClause,
    columns: { githubAccessToken: false },
    orderBy: [asc(users.id)],
    limit,
    offset,
  });

  return {
    items: result,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { githubAccessToken: false },
  });

  if (!user) throw notFound("User", userId);

  // Count submissions
  const [submissionsCountResult] = await db
    .select({ count: count() })
    .from(submissions)
    .where(eq(submissions.userId, userId));

  return {
    ...user,
    submissionCount: submissionsCountResult?.count ?? 0,
  };
}

export async function updateUser(
  adminId: string,
  userId: string,
  data: UpdateUserInput
) {
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning({ id: users.id, role: users.role, rank: users.rank, isActive: users.isActive });

  if (!updated) throw notFound("User", userId);

  // Audit log
  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
    targetType: "user",
    targetId: userId,
    metadata: data,
  });

  return updated;
}

export async function changeUserRole(
  adminId: string,
  userId: string,
  data: ChangeRoleInput
) {
  const [updated] = await db
    .update(users)
    .set({ role: data.role })
    .where(eq(users.id, userId))
    .returning({ id: users.id, role: users.role });

  if (!updated) throw notFound("User", userId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
    targetType: "user",
    targetId: userId,
    metadata: { newRole: data.role },
  });

  return updated;
}

export async function deleteUser(adminId: string, userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw notFound("User", userId);

  await db.update(users).set({ isActive: false }).where(eq(users.id, userId));

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.USER_DELETED,
    targetType: "user",
    targetId: userId,
    metadata: { username: user.username },
  });
}

// ──────────────────────────────────────────────
// Task Management
// ──────────────────────────────────────────────

export async function createTask(adminId: string, data: CreateTaskInput) {
  const [task] = await db
    .insert(tasks)
    .values({ ...data, createdBy: adminId })
    .returning();

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.TASK_CREATED,
    targetType: "task",
    targetId: task!.id,
    metadata: { title: data.title },
  });

  return task!;
}

export async function toggleAllTasks(adminId: string, isActive: boolean) {
  const result = await db.update(tasks).set({ isActive }).returning({ id: tasks.id });
  
  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.TASK_UPDATED,
    targetType: "system",
    targetId: adminId, // Must be a valid UUID
    metadata: { isActive, count: result.length, scope: "all_tasks" },
  });

  return result.length;
}

export async function getAllTasks(cursor?: string, limit = 20) {
  const conditions = [];
  if (cursor) conditions.push(gt(tasks.id, cursor));

  const result = await db.query.tasks.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(tasks.createdAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

export async function updateTask(
  adminId: string,
  taskId: string,
  data: UpdateTaskInput
) {
  const deadline = typeof data.deadline === "string"
    ? (data.deadline ? new Date(data.deadline) : null)
    : data.deadline;
  const updateData = { ...data, ...(deadline !== undefined ? { deadline } : {}) };

  const [updated] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updated) throw notFound("Task", taskId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.TASK_UPDATED,
    targetType: "task",
    targetId: taskId,
    metadata: data,
  });

  return updated;
}

export async function deleteTask(adminId: string, taskId: string) {
  const [updated] = await db
    .update(tasks)
    .set({ isActive: false })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updated) throw notFound("Task", taskId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.TASK_DELETED,
    targetType: "task",
    targetId: taskId,
  });
}

// ──────────────────────────────────────────────
// Submission & Review Oversight
// ──────────────────────────────────────────────

export async function getAllSubmissions(
  filters: { status?: string; judgeId?: string; search?: string; cursor?: string; limit?: number } = {}
) {
  const limit = filters.limit ?? 20;
  const conditions = [];

  if (filters.status)
    conditions.push(eq(submissions.status, filters.status as "pending" | "in_review" | "approved" | "rejected"));
  if (filters.judgeId) conditions.push(eq(submissions.assignedJudgeId, filters.judgeId));
  if (filters.search) {
    conditions.push(
      inArray(
        submissions.userId,
        db.select({ id: users.id }).from(users).where(or(ilike(users.username, `%${filters.search}%`), ilike(users.email, `%${filters.search}%`)))
      )
    );
  }
  if (filters.cursor) conditions.push(gt(submissions.id, filters.cursor));

  const result = await db.query.submissions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      task: { columns: { id: true, title: true, category: true } },
      user: { columns: { id: true, username: true } },
      assignedJudge: { columns: { id: true, username: true } },
      review: true,
    },
    orderBy: [desc(submissions.submittedAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const rawItems = hasMore ? result.slice(0, limit) : result;

  const items = rawItems.map((s) => ({
    id: s.id,
    taskId: s.taskId,
    taskTitle: s.task?.title,
    userId: s.userId,
    userName: s.user?.username,
    repoId: s.repoId,
    repoUrl: s.repoUrl,
    repoName: s.repoName,
    status: s.status,
    assignedJudgeId: s.assignedJudgeId,
    judgeName: s.assignedJudge?.username,
    autoAssigned: s.autoAssigned,
    submittedAt: s.submittedAt,
    score: s.review?.totalScore ?? null,
    review: enrichReviewWithScores(s.review),
  }));

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

export async function getSubmissionById(submissionId: string) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
    with: { task: true, user: true, assignedJudge: true, review: true },
  });

  if (!submission) throw notFound("Submission", submissionId);
  
  return {
    id: submission.id,
    taskId: submission.taskId,
    taskTitle: submission.task?.title,
    userId: submission.userId,
    userName: submission.user?.username,
    repoId: submission.repoId,
    repoUrl: submission.repoUrl,
    repoName: submission.repoName,
    status: submission.status,
    assignedJudgeId: submission.assignedJudgeId,
    judgeName: submission.assignedJudge?.username,
    autoAssigned: submission.autoAssigned,
    submittedAt: submission.submittedAt,
    score: submission.review?.totalScore ?? null,
    review: enrichReviewWithScores(submission.review),
    task: submission.task,
    user: submission.user,
    assignedJudge: submission.assignedJudge,
  };
}

export async function manualAssign(
  adminId: string,
  submissionId: string,
  data: ManualAssignInput
) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) throw notFound("Submission", submissionId);

  const judge = await db.query.users.findFirst({
    where: and(eq(users.id, data.judgeId), eq(users.role, "judge")),
  });

  if (!judge) throw notFound("Judge", data.judgeId);

  // Self-review guard
  if (submission.userId === data.judgeId) {
    throw badRequest("Cannot assign a judge to their own submission", "SELF_REVIEW");
  }

  await db
    .update(submissions)
    .set({
      assignedJudgeId: data.judgeId,
      assignedAt: new Date(),
      status: "in_review",
      autoAssigned: false,
    })
    .where(eq(submissions.id, submissionId));

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.SUBMISSION_ASSIGNED,
    targetType: "submission",
    targetId: submissionId,
    metadata: { judgeId: data.judgeId },
  });

  await createNotification({
    userId: data.judgeId,
    type: NOTIFICATION_TYPES.SUBMISSION_ASSIGNED,
    message: "You have been manually assigned a submission to review",
    relatedEntityId: submissionId,
  });
}

export async function getUnassignedSubmissions(cursor?: string, limit = 20) {
  const conditions = [
    eq(submissions.status, "pending"),
    sql`${submissions.assignedJudgeId} IS NULL`,
  ];
  if (cursor) conditions.push(gt(submissions.id, cursor));

  const result = await db.query.submissions.findMany({
    where: and(...conditions),
    with: {
      task: { columns: { id: true, title: true } },
      user: { columns: { id: true, username: true } },
    },
    orderBy: [asc(submissions.submittedAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const rawItems = hasMore ? result.slice(0, limit) : result;

  const items = rawItems.map((s) => ({
    id: s.id,
    taskId: s.taskId,
    taskTitle: s.task?.title,
    userId: s.userId,
    userName: s.user?.username,
    repoId: s.repoId,
    repoUrl: s.repoUrl,
    repoName: s.repoName,
    status: s.status,
    assignedJudgeId: s.assignedJudgeId,
    autoAssigned: s.autoAssigned,
    submittedAt: s.submittedAt,
    task: s.task,
    user: s.user,
  }));

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

export async function adminReassign(
  adminId: string,
  submissionId: string,
  excludeJudgeId?: string
) {
  const assigned = await reassignSubmission(submissionId, excludeJudgeId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.SUBMISSION_REASSIGNED,
    targetType: "submission",
    targetId: submissionId,
    metadata: { excludeJudgeId },
  });

  return assigned;
}

export async function overrideReview(
  adminId: string,
  reviewId: string,
  data: OverrideReviewInput
) {
  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    with: { submission: true },
  });

  if (!review) throw notFound("Review", reviewId);

  const updateData: Record<string, unknown> = {};
  if (data.totalScore !== undefined) updateData.totalScore = data.totalScore;
  
  if (data.scores) {
    updateData.scoreBreakdown = data.scores.reduce((acc, s) => {
      acc[s.criterionId] = s.score;
      return acc;
    }, {} as Record<string, number>);
    updateData.totalScore = data.scores.reduce((sum, s) => sum + s.score, 0);
  }

  if (data.feedback !== undefined) updateData.feedback = data.feedback;

  let updated = review;
  if (Object.keys(updateData).length > 0) {
    const [dbUpdated] = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, reviewId))
      .returning();
    updated = { ...dbUpdated!, submission: review.submission };
  }

  // Update submission decision if provided
  if (data.decision && review.submission) {
    await db
      .update(submissions)
      .set({ status: data.decision })
      .where(eq(submissions.id, review.submissionId));

    if (data.decision === "approved") {
      await checkAndPromoteUser(review.submission.userId, review.submission.taskId);
    }
  }

  // Sync user or team score
  if (review.submission) {
    if (review.submission.teamId) {
      await syncTeamScore(review.submission.teamId);
    } else {
      await syncUserScore(review.submission.userId);
    }
  }

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.REVIEW_OVERRIDDEN,
    targetType: "review",
    targetId: reviewId,
    metadata: data,
  });

  // Recalculate leaderboard
  // await leaderboardQueue.add("recalculate", {});

  return enrichReviewWithScores(updated)!;
}

export async function getAllReviews(cursor?: string, limit = 20) {
  const conditions = [];
  if (cursor) conditions.push(gt(reviews.id, cursor));

  const result = await db.query.reviews.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      judge: { columns: { id: true, username: true } },
      submission: {
        with: {
          task: { columns: { id: true, title: true } },
          user: { columns: { id: true, username: true } },
        },
      },
    },
    orderBy: [desc(reviews.reviewedAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

// ──────────────────────────────────────────────
// Leaderboard Management
// ──────────────────────────────────────────────

export async function triggerLeaderboardRecalculation() {
  // const job = await leaderboardQueue.add("admin-recalculate", {});
  return { jobId: "sync" };
}

// ──────────────────────────────────────────────
// Judge Management
// ──────────────────────────────────────────────

export async function getJudges(cursor?: string, limit = 20) {
  const conditions = [eq(users.role, "judge")];
  if (cursor) conditions.push(gt(users.id, cursor));

  const judges = await db.query.users.findMany({
    where: and(...conditions),
    columns: { githubAccessToken: false },
    orderBy: [asc(users.id)],
    limit: limit + 1,
  });

  const hasMore = judges.length > limit;
  const items = hasMore ? judges.slice(0, limit) : judges;

  // Enrich with workload stats
  const enriched = await Promise.all(
    items.map(async (judge) => {
      const loadScore = await computeJudgeLoadScore(judge.id, judge.username);
      return { ...judge, workload: loadScore };
    })
  );

  return {
    items: enriched,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

// ──────────────────────────────────────────────
// Community Posts (admin CRUD)
// ──────────────────────────────────────────────

export async function createPost(adminId: string, data: CreatePostInput) {
  const [post] = await db
    .insert(communityPosts)
    .values({ ...data, createdBy: adminId })
    .returning();

  return post!;
}

export async function getAdminPosts(cursor?: string, limit = 20) {
  const conditions = [];
  if (cursor) conditions.push(gt(communityPosts.id, cursor));

  const result = await db.query.communityPosts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(communityPosts.createdAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

export async function getAdminPostById(adminId: string, postId: string) {
  const post = await db.query.communityPosts.findFirst({
    where: eq(communityPosts.id, postId),
  });
  if (!post) throw notFound("Post", postId);
  return post;
}

export async function updatePost(
  adminId: string,
  postId: string,
  data: UpdatePostInput
) {
  const [updated] = await db
    .update(communityPosts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(communityPosts.id, postId))
    .returning();

  if (!updated) throw notFound("Post", postId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.POST_UPDATED,
    targetType: "post",
    targetId: postId,
    metadata: data,
  });

  return updated;
}

export async function deletePost(adminId: string, postId: string) {
  const post = await db.query.communityPosts.findFirst({
    where: eq(communityPosts.id, postId),
  });
  if (!post) throw notFound("Post", postId);

  await db.delete(communityPosts).where(eq(communityPosts.id, postId));

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.POST_DELETED,
    targetType: "post",
    targetId: postId,
  });
}

// ──────────────────────────────────────────────
// Audit Log
// ──────────────────────────────────────────────

export async function getAuditLog(filters: { actor?: string; action?: string; cursor?: string; limit?: number } = {}) {
  const limit = filters.limit ?? 20;
  const conditions = [];
  if (filters.action) conditions.push(eq(auditLog.action, filters.action));
  // Note: we can't easily ilike search on the joined user's username here without a join, 
  // but if actor is passed, we can try matching actorId for now, or just leave actor search to exact match if it was ID.
  // Actually, since we need to search by username, we could do it with a subquery, but since Drizzle relational queries don't support where on relations at the top level, 
  // we'll leave actor search as it might require a larger refactor, or we can just filter in memory if needed. Let's do a simple ilike on actorId which isn't very useful, but we can't easily join.
  // Let's omit actor filtering for now or just filter by exact actorId if provided.
  if (filters.actor) conditions.push(eq(auditLog.actorId, filters.actor));
  if (filters.cursor) conditions.push(gt(auditLog.id, filters.cursor));

  const result = await db.query.auditLog.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { actor: { columns: { id: true, username: true } } },
    orderBy: [desc(auditLog.createdAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

/**
 * Get aggregated performance metrics for a specific judge.
 */
export async function getJudgePerformance(judgeId: string) {
  const judge = await db.query.users.findFirst({
    where: eq(users.id, judgeId),
    columns: { username: true, fullName: true },
  });

  if (!judge) throw notFound("Judge", judgeId);

  const [reviewedResult] = await db
    .select({ count: count() })
    .from(reviews)
    .where(eq(reviews.judgeId, judgeId));
  const totalReviews = reviewedResult?.count ?? 0;

  const [avgScoreResult] = await db
    .select({ avgScore: sql<number>`COALESCE(AVG(${reviews.totalScore}), 0)` })
    .from(reviews)
    .where(eq(reviews.judgeId, judgeId));
  const avgScoreGiven = Number(avgScoreResult?.avgScore ?? 0);

  const sampleSize = env.JUDGE_TURNAROUND_SAMPLE_SIZE;
  const turnaroundResult = await db.execute(sql`
    WITH recent_reviews AS (
      SELECT r.reviewed_at, s.assigned_at
      FROM reviews r
      INNER JOIN submissions s ON s.id = r.submission_id
      WHERE r.judge_id = ${judgeId}
        AND s.assigned_at IS NOT NULL
      ORDER BY r.reviewed_at DESC
      LIMIT ${sampleSize}
    )
    SELECT AVG(
      EXTRACT(EPOCH FROM (reviewed_at - assigned_at)) / 3600
    ) as avg_hours
    FROM recent_reviews
  `);
  const avgTurnaroundHours = Number(
    (turnaroundResult as unknown as Array<{ avg_hours: string | null }>)[0]?.avg_hours ?? 0
  );

  const [pendingResult] = await db
    .select({ count: count() })
    .from(submissions)
    .where(
      and(
        eq(submissions.assignedJudgeId, judgeId),
        eq(submissions.status, "in_review")
      )
    );
  const pendingCount = pendingResult?.count ?? 0;

  return {
    judgeId,
    judgeName: judge.fullName || judge.username,
    totalReviews,
    avgScoreGiven,
    avgTurnaroundHours,
    pendingCount,
  };
}

// ──────────────────────────────────────────────
// Team Management (Admin)
// ──────────────────────────────────────────────

export async function getTeams(
  filters: { search?: string; status?: string; page?: number; limit?: number } = {}
) {
  const limit = filters.limit ?? 20;
  const page = filters.page ?? 1;
  const offset = (page - 1) * limit;
  const conditions = [];

  if (filters.status && filters.status !== "all") {
    conditions.push(eq(teams.status, filters.status));
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    // Subquery for team IDs containing matching members
    const matchingMemberTeamIds = await db
      .select({ teamId: users.currentTeamId })
      .from(users)
      .where(
        and(
          sql`${users.currentTeamId} IS NOT NULL`,
          or(
            ilike(users.username, `%${q}%`),
            ilike(users.fullName, `%${q}%`),
            ilike(users.email, `%${q}%`)
          )
        )
      );

    const memberTeamIds = matchingMemberTeamIds
      .map((r) => r.teamId)
      .filter((id): id is string => Boolean(id));

    if (memberTeamIds.length > 0) {
      conditions.push(
        or(
          ilike(teams.name, `%${q}%`),
          ilike(teams.joinCode, `%${q}%`),
          inArray(teams.id, memberTeamIds)
        )
      );
    } else {
      conditions.push(
        or(
          ilike(teams.name, `%${q}%`),
          ilike(teams.joinCode, `%${q}%`)
        )
      );
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(teams)
    .where(whereClause);

  const teamList = await db
    .select()
    .from(teams)
    .where(whereClause)
    .orderBy(desc(teams.score), desc(teams.createdAt))
    .limit(limit)
    .offset(offset);

  // Stats across all teams (independent of current pagination/search)
  const [totalTeamsCount] = await db.select({ count: count() }).from(teams);
  const [activeTeamsCount] = await db
    .select({ count: count() })
    .from(teams)
    .where(eq(teams.status, "active"));
  const [incompleteTeamsCount] = await db
    .select({ count: count() })
    .from(teams)
    .where(eq(teams.status, "incomplete"));
  const [avgScoreResult] = await db
    .select({ avg: sql<number>`COALESCE(AVG(${teams.score}), 0)` })
    .from(teams);

  // Fetch all members for the returned teams
  const teamIds = teamList.map((t) => t.id);
  const teamMembers = teamIds.length > 0
    ? await db
        .select({
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          avatarUrl: users.avatarUrl,
          phone: users.phone,
          collegeName: users.collegeName,
          branch: users.branch,
          year: users.year,
          bio: users.bio,
          discord: users.discord,
          score: users.score,
          rank: users.rank,
          currentTeamId: users.currentTeamId,
          teamRole: users.teamRole,
          teamJoinedAt: users.teamJoinedAt,
        })
        .from(users)
        .where(inArray(users.currentTeamId, teamIds))
    : [];

  const items = teamList.map((t) => {
    const members = teamMembers
      .filter((m) => m.currentTeamId === t.id)
      .map((m) => ({
        id: m.id,
        username: m.username,
        fullName: m.fullName,
        email: m.email,
        avatarUrl: m.avatarUrl,
        phone: m.phone,
        collegeName: m.collegeName,
        branch: m.branch,
        year: m.year,
        bio: m.bio,
        discord: m.discord,
        score: m.score,
        rank: m.rank,
        teamRole: (m.teamRole || "member") as "leader" | "member",
        teamJoinedAt: m.teamJoinedAt ? m.teamJoinedAt.toISOString() : null,
      }));

    const leader = members.find((m) => m.teamRole === "leader") || members[0] || null;

    return {
      id: t.id,
      name: t.name,
      joinCode: t.joinCode,
      status: t.status as "incomplete" | "active",
      score: t.score,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      memberCount: members.length,
      leader: leader
        ? {
            id: leader.id,
            username: leader.username,
            fullName: leader.fullName,
            avatarUrl: leader.avatarUrl,
            email: leader.email,
          }
        : null,
      members,
    };
  });

  return {
    items,
    stats: {
      totalTeams: totalTeamsCount?.count ?? 0,
      activeTeams: activeTeamsCount?.count ?? 0,
      incompleteTeams: incompleteTeamsCount?.count ?? 0,
      avgScore: Math.round(Number(avgScoreResult?.avg ?? 0)),
    },
    meta: {
      page,
      limit,
      total: totalResult?.count ?? 0,
      totalPages: Math.ceil((totalResult?.count ?? 0) / limit),
    },
  };
}

export async function disbandTeamAsAdmin(teamId: string, adminId: string) {
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!team) throw notFound("Team", teamId);

  await db.transaction(async (tx) => {
    // Reset users belonging to this team to solo
    await tx
      .update(users)
      .set({
        currentTeamId: null,
        teamRole: null,
        teamJoinedAt: null,
      })
      .where(eq(users.currentTeamId, teamId));

    // Delete the team record
    await tx.delete(teams).where(eq(teams.id, teamId));

    // Audit log
    await tx.insert(auditLog).values({
      actorId: adminId,
      action: AUDIT_ACTIONS.TEAM_DISBANDED,
      targetType: "team",
      targetId: teamId,
      metadata: { name: team.name, joinCode: team.joinCode },
    });
  });

  return { success: true, teamId };
}

export async function removeTeamMemberAsAdmin(
  teamId: string,
  userId: string,
  adminId: string
) {
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!team) throw notFound("Team", teamId);

  const [userToRemove] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.currentTeamId, teamId)))
    .limit(1);

  if (!userToRemove) throw notFound("Member in Team", userId);

  await db.transaction(async (tx) => {
    // Reset user to solo
    await tx
      .update(users)
      .set({
        currentTeamId: null,
        teamRole: null,
        teamJoinedAt: null,
      })
      .where(eq(users.id, userId));

    // Check remaining members
    const remainingMembers = await tx
      .select()
      .from(users)
      .where(eq(users.currentTeamId, teamId));

    if (remainingMembers.length === 0) {
      // If no members left, delete the team
      await tx.delete(teams).where(eq(teams.id, teamId));
    } else {
      // If leader was removed, promote the remaining member to leader
      if (userToRemove.teamRole === "leader") {
        await tx
          .update(users)
          .set({ teamRole: "leader" })
          .where(eq(users.id, remainingMembers[0]!.id));
      }

      // Update status to incomplete (since max is 2 and now only 1)
      await tx
        .update(teams)
        .set({ status: "incomplete", updatedAt: new Date() })
        .where(eq(teams.id, teamId));
    }

    // Audit log
    await tx.insert(auditLog).values({
      actorId: adminId,
      action: AUDIT_ACTIONS.TEAM_MEMBER_REMOVED,
      targetType: "team",
      targetId: teamId,
      metadata: { userId, username: userToRemove.username, teamName: team.name },
    });
  });

  return { success: true, teamId, userId };
}
