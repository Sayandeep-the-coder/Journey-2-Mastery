// ─── Roles & Ranks ───
export type Role = 'user' | 'judge' | 'admin';
export type Rank = 'Ronin' | 'Kenshi' | 'Samurai' | 'Shogun' | 'Team';
export type SubmissionStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type Difficulty = 'easy' | 'medium' | 'hard';
export const TASK_CATEGORIES = [
  'Frontend',
  'Backend',
  'Fullstack',
  'DSA',
  'System Design',
  'AI/ML',
  'DevOps',
  'Documentation',
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

// ─── User ───
export interface User {
  id: string;
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  role: Role;
  isProfileComplete: boolean;
  fullName?: string;
  collegeName?: string;
  branch?: string;
  year?: string;
  phone?: string;
  bio?: string;
  discord?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  teamType?: TeamType;
  teamName?: string | null;
  teamMemberCount?: number;
  rank: Rank;
  score: number;
  currentTeamId?: string | null;
  teamRole?: string | null;
  teamJoinedAt?: string | null;
  team?: {
    id: string;
    name: string;
    joinCode?: string;
    score?: number;
    rank?: number;
    status?: string;
    teamRole?: string;
    memberCount?: number;
    teamType?: TeamType;
    members?: LeaderboardTeamMember[];
  } | null;
  createdAt?: string;
}

// ─── Profile Completion ───
export interface CompleteProfilePayload {
  fullName: string;
  collegeName: string;
  branch: string;
  year: string;
  phone: string;
  bio: string;
  discord?: string;
  instagram?: string;
  twitter?: string;
}

// ─── Tasks ───
export interface Task {
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
  requirements?: string;
  category: TaskCategory | string;
  categoryName?: string;
  points: number;
  bonusPoints?: number;
  difficulty: Difficulty;
  rankRequired?: Rank;
  deadline?: string | null;
  isActive?: boolean;
  status?: SubmissionStatus | 'submitted';
  rubric?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

// ─── Submissions ───
export interface Submission {
  id: string;
  taskId: string;
  task?: Task;
  taskTitle?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  repoUrl: string;
  repoName?: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  judgeId?: string;
  judgeName?: string;
  submittedAt: string;
  reviewedAt?: string;
  review?: Review;
}

// ─── Reviews ───
export interface Review {
  id: string;
  submissionId: string;
  judgeId: string;
  judgeName?: string;
  userEmail?: string;
  userName?: string;
  taskTitle?: string;
  submission?: {
    id?: string;
    taskId?: string;
    taskTitle?: string;
    task?: { id: string; title: string; category?: string };
    user?: { id: string; username: string; email?: string; fullName?: string };
  };
  scores: CriterionScore[];
  totalScore: number;
  feedback: string;
  createdAt: string;
  updatedAt?: string;
  canEdit?: boolean;
}

export interface CriterionScore {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
}

export interface ReviewCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  taskType?: string;
}

// ─── Comments ───
export interface Comment {
  id: string;
  submissionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: Role;
  content: string;
  createdAt: string;
}

// ─── Posts ───
export interface Post {
  id: string;
  title: string;
  description: string;
  posterImageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Notifications ───
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ─── Badges ───
export interface UserBadge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  earnedAt: string;
}

// ─── Ranks ───
export interface RankTier {
  name: Rank;
  minScore: number;
  maxScore?: number;
  description: string;
}

// ─── GitHub Repos ───
export interface RepoInfo {
  repoId: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  updatedAt: string;
  language?: string;
  stargazersCount?: number;
  fork?: boolean;
}

export interface RankConfig {
  name: string;
  pts: number;
  desc: string;
  diff: string;
}

// ─── Dashboard Data ───
export interface UserDashboardData {
  rank: Rank;
  score: number;
  tasksCompleted: number;
  tasksRemaining: number;
  totalScore: number;
  rankProgress: number; // 0-100 percentage to next rank
  recentActivity: ActivityItem[];
  ranksConfig?: RankConfig[];
  currentTask?: Task | null;
  tasksAvailable?: number;
  stats: {
    totalPoints: number;
    tasksCompleted: number;
    pendingReviews: number;
  };
  recentSubmissions: Submission[];
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface JudgeDashboardData {
  pendingCount: number;
  reviewedCount: number;
  avgTurnaround: string;
  recentReviews: Review[];
}

export interface JudgeWorkload {
  assignedCount: number;
  completedCount: number;
  loadScore: number;
  avgTurnaroundHours: number;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalJudges: number;
  totalTasks: number;
  totalSubmissions: number;
  totalTeams?: number;
  statusBreakdown: { status: string; count: number }[];
  topPerformers: { userId: string; userName: string; score: number; rank: Rank }[];
  unassignedCount: number;
}

export interface AdminActivity {
  activities: ActivityItem[];
}

// ─── Admin User ───
export interface AdminUser extends User {
  submissionCount?: number;
  reviewCount?: number;
  lastActiveAt?: string;
}

// ─── Judge Performance ───
export interface JudgePerformance {
  judgeId: string;
  judgeName: string;
  totalReviews: number;
  avgScoreGiven: number;
  avgTurnaroundHours: number;
  pendingCount: number;
}

// ─── Audit Log ───
export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  createdAt: string;
}

// ─── Sessions ───
export interface UserSession {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
  isCurrent: boolean;
}

// ─── Settings ───
export interface UserSettings {
  emailNotifications: boolean;
  submissionUpdates: boolean;
  reviewNotifications: boolean;
  leaderboardUpdates: boolean;
}

// ─── Pagination ───
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export type TeamType = 'solo' | 'duo' | 'trio';

export interface LeaderboardTeamMember {
  id?: string;
  userId?: string;
  username?: string;
  userName?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  rank?: Rank;
  role?: string;
  teamRole?: 'leader' | 'member' | null;
  score?: number;
  bio?: string | null;
  collegeName?: string | null;
  branch?: string | null;
  discord?: string | null;
}

// ─── Leaderboard ───
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  score: number;
  tasksCompleted: number;
  userRank: Rank;
  teamType?: TeamType;
  teamName?: string | null;
  teamId?: string | null;
  teamMembers?: LeaderboardTeamMember[];
  scoreBreakdown?: { category: string; points: number }[];
}

// ─── Teams ───
export interface TeamMember {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  role: 'leader' | 'member';
  joinedAt: string;
}

export interface TeamDetail {
  id: string;
  name: string;
  status: 'incomplete' | 'active';
  score: number;
  members: TeamMember[];
  joinCode?: string;
}

// ─── Admin Teams ───
export interface AdminTeamMember {
  id: string;
  username: string;
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  collegeName?: string | null;
  branch?: string | null;
  year?: string | null;
  bio?: string | null;
  discord?: string | null;
  score: number;
  rank: Rank;
  teamRole: 'leader' | 'member';
  teamJoinedAt: string | null;
}

export interface AdminTeamItem {
  id: string;
  name: string;
  joinCode: string;
  status: 'incomplete' | 'active';
  score: number;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  leader?: {
    id: string;
    username: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
  } | null;
  members: AdminTeamMember[];
}

export interface AdminTeamsStats {
  totalTeams: number;
  activeTeams: number;
  incompleteTeams: number;
  avgScore: number;
}
