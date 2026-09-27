import { z } from "zod";
import { TASK_CATEGORIES, TRACKS } from "../db/schema";

export const criterionSchema = z.object({
  id: z.string().min(1, "Criterion ID is required"),
  name: z.string().min(1, "Criterion name is required"),
  description: z.string().optional().default(""),
  maxScore: z.coerce.number().int().min(1, "Max score must be at least 1"),
});

/**
 * POST /api/v1/admin/tasks
 */
export const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  shortDescription: z.string().min(5).max(500),
  description: z.string().min(10),
  requirements: z.string().optional(),
  track: z.enum(TRACKS).default("main"),
  taskType: z.string().optional(),
  category: z.enum(TASK_CATEGORIES),
  difficulty: z.enum(["easy", "medium", "hard"]),
  rankRequired: z.enum(["Ronin", "Kenshi", "Samurai", "Shogun"]).default("Ronin"),
  points: z.number().int().min(0).max(1000),
  bonusPoints: z.number().int().min(0).default(0),
  deadline: z.preprocess((arg) => (arg === '' || arg == null ? undefined : new Date(arg as string)), z.date().optional()),
  criteria: z.array(criterionSchema).min(1, "At least one judging criterion is required"),
  passingScore: z.coerce.number().int().min(1, "Approval lowest score must be at least 1"),
}).refine(
  (data) => data.passingScore <= data.criteria.reduce((sum, c) => sum + c.maxScore, 0),
  { message: "Passing score cannot exceed total maximum criteria score", path: ["passingScore"] }
);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * PATCH /api/v1/admin/tasks/:id
 */
export const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  shortDescription: z.string().min(5).max(500).optional(),
  description: z.string().min(10).optional(),
  requirements: z.string().optional(),
  track: z.enum(TRACKS).optional(),
  taskType: z.string().optional().nullable(),
  category: z.enum(TASK_CATEGORIES).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  rankRequired: z.enum(["Ronin", "Kenshi", "Samurai", "Shogun"]).optional(),
  points: z.number().int().min(0).max(1000).optional(),
  bonusPoints: z.number().int().min(0).optional(),
  deadline: z.preprocess((arg) => (arg === '' || arg == null ? null : new Date(arg as string)), z.date().nullable().optional()),
  isActive: z.boolean().optional(),
  criteria: z.array(criterionSchema).min(1).optional(),
  passingScore: z.coerce.number().int().min(1).optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * PATCH /api/v1/admin/users/:id
 */
export const updateUserSchema = z.object({
  role: z.enum(["admin", "judge", "user"]).optional(),
  rank: z.enum(["Ronin", "Kenshi", "Samurai", "Shogun"]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * PATCH /api/v1/admin/users/:id/role
 */
export const changeRoleSchema = z.object({
  role: z.enum(["admin", "judge", "user"]),
});

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

/**
 * POST /api/v1/admin/submissions/:id/assign
 */
export const manualAssignSchema = z.object({
  judgeId: z.string().uuid("Invalid judge ID"),
});

export type ManualAssignInput = z.infer<typeof manualAssignSchema>;

/**
 * PATCH /api/v1/admin/reviews/:id/override
 */
export const overrideReviewSchema = z.object({
  totalScore: z.number().int().min(0).max(100).optional(),
  scores: z.array(z.object({
    criterionId: z.string(),
    score: z.number().int().min(0)
  })).optional(),
  feedback: z.string().max(5000).optional(),
  decision: z.enum(["approved", "rejected"]).optional(),
});

export type OverrideReviewInput = z.infer<typeof overrideReviewSchema>;

/**
 * POST /api/v1/admin/posts
 */
export const createPostSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().min(10),
  posterImageUrl: z.string().url().optional(),
  isPublished: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/**
 * PATCH /api/v1/admin/posts/:id
 */
export const updatePostSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  description: z.string().min(10).optional(),
  posterImageUrl: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
