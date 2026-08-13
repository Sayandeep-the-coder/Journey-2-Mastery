import { z } from 'zod';

// ─── Profile Completion ───
export const completeProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  collegeName: z.string().min(2, 'College name is required').max(200),
  branch: z.string().min(2, 'Branch is required').max(100),
  year: z.string().min(1, 'Year is required'),
  phone: z.string().min(7, 'Enter a valid phone number').max(20),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional().default(''),
  discord: z.string().max(100).optional().default(''),
  instagram: z.string().max(100).optional().default(''),
  twitter: z.string().max(100).optional().default(''),
}).strict();
export type CompleteProfileForm = z.infer<typeof completeProfileSchema>;

// ─── Profile Update ───
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  collegeName: z.string().min(2).max(200).optional(),
  branch: z.string().min(2).max(100).optional(),
  year: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  discord: z.string().max(100).optional(),
  instagram: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
}).strict();
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

// ─── Task Management (Admin) ───
export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  shortDescription: z.string().min(5, 'Short description is required').max(500),
  description: z.string().min(10, 'Task details must be at least 10 characters'),
  requirements: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.coerce.number().min(1, 'Points must be at least 1').max(1000),
  bonusPoints: z.coerce.number().min(0).default(0),
  rankRequired: z.enum(['Ronin', 'Kenshi', 'Samurai', 'Shogun']).optional(),
  deadline: z.string().optional(),
}).strict();
export type TaskForm = z.infer<typeof taskSchema>;

// ─── Review Submission (Judge) ───
export const reviewSchema = z.object({
  scores: z.array(z.object({
    criterionId: z.string(),
    score: z.coerce.number().min(0),
  })).min(1, 'At least one criterion score is required'),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters').max(2000),
}).strict();
export type ReviewForm = z.infer<typeof reviewSchema>;

// ─── Post Creation (Admin) ───
export const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
}).strict();
export type PostForm = z.infer<typeof postSchema>;

// ─── Settings ───
export const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  submissionUpdates: z.boolean(),
  reviewNotifications: z.boolean(),
  leaderboardUpdates: z.boolean(),
}).strict();
export type SettingsForm = z.infer<typeof settingsSchema>;

// ─── Comment ───
export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
}).strict();
export type CommentForm = z.infer<typeof commentSchema>;

// ─── Override Review (Admin) ───
export const overrideReviewSchema = z.object({
  score: z.coerce.number().min(0),
  reason: z.string().min(10, 'A reason is required when overriding a score').max(500),
}).strict();
export type OverrideReviewForm = z.infer<typeof overrideReviewSchema>;
