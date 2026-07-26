<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.44-C5F74F?logo=drizzle" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

# ⛩️ Journey to Mastery (J2M)

A full-stack gamified learning platform inspired by the Japanese martial arts ranking system. Students progress through ranks — **Ronin → Kenshi → Samurai → Shogun** — by completing coding tasks, submitting GitHub repositories for review, and earning scores on a competitive leaderboard.

---

## ✨ Features

### 👤 User Flow
- **GitHub OAuth** login with one-click authentication
- **Profile onboarding** — college, branch, year, bio
- **Task browser** — filter by difficulty (Easy/Medium/Hard) and rank requirement
- **Task status lists** — separate lists for completed and pending tasks
- **GitHub submission** — pick a repo directly from your GitHub account and manage submissions
- **Profile and settings** — update your details, customize user settings, or delete account
- **Live progress tracking** — rank progress bar, score, and submission history
- **Leaderboard** — competitive ranking across all users
- **Notifications** — real-time updates on submission reviews
- **Community posts** — admin-published blog/announcement feed

### 👥 Team Flow
- **Team creation** — create a new team with a custom name
- **Join-by-code** — easily join an existing team via a unique, shareable code
- **Team profile** — view team members, roles, and overall workload/progress
- **Team management** — regenerate join codes, transfer leadership, leave team, remove member, or disband team

### ⚖️ Judge Flow
- **Review queue** — auto-assigned submissions via smart load balancing
- **Score rubric** — structured scoring with comments and feedback
- **Review history** — track past reviews and edit within a 24-hour window
- **Threaded comments** — discussion on individual submissions between submitter, judge, and admin

### 🛡️ Admin Flow
- **Full CRUD** — manage users, tasks, submissions, judges, and posts
- **Judge management** — promote/demote, view workload/performance metrics
- **Unassigned queue** — manually assign orphaned submissions
- **Leaderboard management** — recalculate scores and trigger updates
- **Audit logging** — track all administrative actions
- **Activity Feed** — real-time tracking of platform activity

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                │
│                                                         │
│   ┌─────────────────────┐     ┌─────────────────────┐   │
│   │   Frontend Pages    │     │   API Routes        │   │
│   │   (React 19, GSAP)  │────▶│   (/api/v1/*)       │   │
│   └─────────────────────┘     └──────────┬──────────┘   │
└──────────────────────────────────────────┼──────────────┘
                                           │
                                 ┌─────────┴─────────┐
                                 ▼                   ▼
                           ┌──────────┐         ┌─────────┐
                           │PostgreSQL│         │  Redis  │
                           │(Drizzle) │         │ (Cache) │
                           └──────────┘         └─────────┘
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Full-Stack Framework | Next.js 16 (App Router), React 19 | SSR/SSG UI & native REST API endpoints |
| Styling & UI | TailwindCSS 4, Radix UI primitives | Modern Japanese editorial aesthetics, dark/light themes |
| Animations | GSAP 3.15, Lenis Smooth Scroll | Scroll-triggered transitions & smooth interactions |
| State & Fetching | TanStack Query v5 | Server state caching, optimistic updates |
| Database | PostgreSQL 16 + Drizzle ORM | Relational schema management & type-safe queries |
| Cache & Session | Redis 7 (ioredis) | Rate limiting, session tracking, & token management |
| File Uploads | S3-compatible / Cloudinary / Local | Profile avatars & community post attachments |
| Authentication | GitHub OAuth 2.0 + JWT | Stateless, secure authentication |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** 16+ (local or cloud like Neon/Supabase)
- **Redis** 7+ (local or Upstash)
- **GitHub OAuth App** — [Create one here](https://github.com/settings/developers)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sayandeep-the-coder/Journey-2-Mastery.git
   cd Journey-2-Mastery
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env   # Or create .env based on the template below
   ```

4. **Apply database schema:**
   ```bash
   npm run db:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3001](http://localhost:3001).

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# ── Core ──
NODE_ENV=development
PORT=3000
API_VERSION=v1
FRONTEND_URL=http://localhost:3001

# ── Database ──
DATABASE_URL=postgresql://postgres:password@localhost:5432/j2m
DATABASE_URL_DIRECT=postgresql://postgres:password@localhost:5432/j2m

# ── Redis ──
REDIS_URL=redis://localhost:6379

# ── Authentication ──
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
ENCRYPTION_KEY=your-32-char-min-encryption-key

# ── GitHub OAuth ──
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/v1/auth/github/callback

# ── File Upload ──
UPLOAD_PROVIDER=local # local | s3 | cloudinary
AWS_S3_ENDPOINT=https://your-s3-endpoint
AWS_S3_REGION=your-region
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# ── Rate Limiting ──
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
RATE_LIMIT_GITHUB_MAX=10

# ── Judge Configuration ──
JUDGE_OVERLOAD_THRESHOLD=15
JUDGE_TURNAROUND_SAMPLE_SIZE=10
REVIEW_EDIT_WINDOW_HOURS=24
```

---

## 📂 Project Structure

```
Journey-2-Mastery/
├── app/                          # Next.js 16 App Router
│   ├── (admin)/admin/            # Admin dashboard & management pages
│   ├── (auth)/                   # Authentication & onboarding flow
│   ├── (judge)/judge/            # Judge review queue & submission review
│   ├── (user)/                   # User dashboard, tasks, submissions, profile
│   ├── join/                     # Join team page
│   └── api/                      # Next.js API Routes
│       └── v1/                   # REST API endpoints per domain
│
├── components/                   # React components
│   ├── admin/                    # Admin-specific UI components
│   ├── judge/                    # Judge evaluation components
│   ├── shared/                   # Shared UI (Navigation, Badges, Modals...)
│   ├── ui/                       # Radix UI primitives (Button, Card, Dialog...)
│   └── user/                     # User dashboard & profile components
│
├── hooks/                        # React hooks
│   ├── queries/                  # TanStack Query custom hooks per domain
│   └── useSession.ts             # Client auth session hook
│
├── lib/                          # Core backend & frontend utilities
│   ├── config/                   # env validation, DB & Redis client setups
│   ├── db/                       # Drizzle ORM schema & client definitions
│   ├── github/                   # GitHub API integration client
│   ├── logger/                   # Pino structured logger
│   ├── middleware/               # Auth & RBAC API route guards
│   ├── services/                 # Core business logic layer
│   ├── utils/                    # Error classes, response helpers, constants
│   ├── validators/               # Zod input validation schemas
│   ├── api-client.ts             # Typed fetch wrapper with handling
│   └── query-client.ts           # TanStack Query client configuration
│
├── types/                        # Shared TypeScript interfaces & types
├── DESIGN.md                     # Japanese editorial design system guide
├── ANIMATIONS.md                 # Animation guidelines (GSAP & Lenis)
├── drizzle.config.ts             # Drizzle Kit configuration
└── next.config.ts                # Next.js configuration
```

---

## 🔌 API Endpoints

All backend REST API endpoints are prefix-routed under `/api/v1`.

### 🔑 [Auth](app/api/v1/auth)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/auth/github` | Redirect to GitHub OAuth consent screen |
| `GET` | `/api/v1/auth/github/callback` | GitHub OAuth callback — exchanges code for JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh JWT access/refresh tokens |
| `GET` | `/api/v1/auth/me` | Get current logged-in user 🔒 |
| `POST` | `/api/v1/auth/logout` | Invalidate current user session 🔒 |
| `GET` | `/api/v1/auth/profile-status` | Check if profile onboarding setup is pending 🔒 |
| `POST` | `/api/v1/auth/complete-profile` | Complete onboarding profile (one-time setup) 🔒 |
| `GET` | `/api/v1/auth/sessions` | List active sessions/devices 🔒 |
| `DELETE` | `/api/v1/auth/sessions/:id` | Revoke a specific active session 🔒 |

### 👤 [User](app/api/v1/user)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/user/dashboard` | Retrieve user dashboard statistics 🔒 |
| `GET` | `/api/v1/user/tasks` | Get all active, rank-eligible tasks 🔒 |
| `GET` | `/api/v1/user/tasks/completed` | List completed tasks 🔒 |
| `GET` | `/api/v1/user/tasks/pending` | List pending tasks/reviews 🔒 |
| `GET` | `/api/v1/user/tasks/:taskId` | Retrieve details of a specific task 🔒 |
| `GET` | `/api/v1/user/github/repos` | List available repositories from user's GitHub 🔒 |
| `POST` | `/api/v1/user/submissions` | Submit a GitHub repository for a task 🔒 |
| `GET` | `/api/v1/user/submissions` | List all own submissions 🔒 |
| `GET` | `/api/v1/user/submissions/:id` | Get detail metrics of a submission 🔒 |
| `PATCH` | `/api/v1/user/submissions/:id` | Update an unreviewed submission 🔒 |
| `DELETE` | `/api/v1/user/submissions/:id` | Cancel/delete an unreviewed submission 🔒 |
| `GET` | `/api/v1/user/profile` | Get own profile details 🔒 |
| `PATCH` | `/api/v1/user/profile` | Update profile information 🔒 |
| `GET` | `/api/v1/user/settings` | Get user settings 🔒 |
| `PATCH` | `/api/v1/user/settings` | Update user settings 🔒 |
| `DELETE` | `/api/v1/user/account` | Delete own user account 🔒 |

### 👥 [Teams](app/api/v1/teams)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/v1/teams` | Create a new team 🔒 |
| `GET` | `/api/v1/teams/my` | Retrieve details of own team 🔒 |
| `POST` | `/api/v1/teams/join` | Join a team using a unique join code 🔒 |
| `GET` | `/api/v1/teams/:id` | View public profile of a team 🔒 |
| `GET` | `/api/v1/teams/:id/members` | Get member list of a team 🔒 |
| `PATCH` | `/api/v1/teams/:id` | Rename/update team details (creator only) 🔒 |
| `POST` | `/api/v1/teams/:id/regenerate-code` | Generate new shareable join code (creator only) 🔒 |
| `DELETE` | `/api/v1/teams/:id` | Disband team (creator only) 🔒 |
| `POST` | `/api/v1/teams/:id/leave` | Leave team 🔒 |
| `DELETE` | `/api/v1/teams/:id/members/:userId` | Remove member from team (creator only) 🔒 |
| `PATCH` | `/api/v1/teams/:id/transfer-leadership` | Transfer ownership to a member (creator only) 🔒 |

### ⚖️ [Judge](app/api/v1/judge)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/judge/dashboard` | Get dashboard statistics for judge workload 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/submissions` | Retrieve judge review queue 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/submissions/:id` | View submission details for evaluation 🔒👨‍⚖️ |
| `POST` | `/api/v1/judge/submissions/:id/review` | Submit a score and review rubric 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/reviews` | View list of completed reviews 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/reviews/:id` | Retrieve detailed review sheet 🔒👨‍⚖️ |
| `PATCH` | `/api/v1/judge/reviews/:id` | Edit feedback/score within edit window 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/criteria` | List general scoring criteria 🔒👨‍⚖️ |
| `GET` | `/api/v1/judge/workload` | View judge capacity and metrics 🔒👨‍⚖️ |

### 🛡️ [Admin](app/api/v1/admin)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/admin/dashboard` | Platform overall analytics 🔒🛡️ |
| `GET` | `/api/v1/admin/dashboard/activity` | Activity audit stream 🔒🛡️ |
| `GET` | `/api/v1/admin/users` | List all registered users 🔒🛡️ |
| `GET` | `/api/v1/admin/users/:id` | Get specific user profile 🔒🛡️ |
| `PATCH` | `/api/v1/admin/users/:id` | Modify user fields 🔒🛡️ |
| `PATCH` | `/api/v1/admin/users/:id/role` | Promote/demote user roles 🔒🛡️ |
| `DELETE` | `/api/v1/admin/users/:id` | Force delete user account 🔒🛡️ |
| `POST` | `/api/v1/admin/tasks` | Create a new task 🔒🛡️ |
| `GET` | `/api/v1/admin/tasks` | List all tasks (including drafts) 🔒🛡️ |
| `PATCH` | `/api/v1/admin/tasks/:id` | Update task requirements/metadata 🔒🛡️ |
| `DELETE` | `/api/v1/admin/tasks/:id` | Delete a task 🔒🛡️ |
| `GET` | `/api/v1/admin/submissions` | List all system submissions 🔒🛡️ |
| `GET` | `/api/v1/admin/submissions/:id` | Get specific submission details 🔒🛡️ |
| `POST` | `/api/v1/admin/submissions/:id/assign` | Manually assign submission to a judge 🔒🛡️ |
| `GET` | `/api/v1/admin/assignment/unassigned` | View unassigned submissions queue 🔒🛡️ |
| `POST` | `/api/v1/admin/assignment/reassign/:submissionId` | Force reassign a submission to another judge 🔒🛡️ |
| `PATCH` | `/api/v1/admin/reviews/:id/override` | Override scoring/review of a judge 🔒🛡️ |
| `GET` | `/api/v1/admin/reviews` | View list of all system reviews 🔒🛡️ |
| `GET` | `/api/v1/admin/leaderboard` | View admin-level leaderboard 🔒🛡️ |
| `POST` | `/api/v1/admin/leaderboard/recalculate` | Trigger system-wide leaderboard recalculation 🔒🛡️ |
| `GET` | `/api/v1/admin/judges` | List judges and active workload statuses 🔒🛡️ |
| `GET` | `/api/v1/admin/judges/:id/performance` | Get judge performance metrics 🔒🛡️ |
| `POST` | `/api/v1/admin/posts/upload-image` | Upload image for community post 🔒🛡️ |
| `POST` | `/api/v1/admin/posts` | Create new community post 🔒🛡️ |
| `GET` | `/api/v1/admin/posts` | List all community posts 🔒🛡️ |
| `PATCH` | `/api/v1/admin/posts/:id` | Update a community post 🔒🛡️ |
| `DELETE` | `/api/v1/admin/posts/:id` | Delete a community post 🔒🛡️ |
| `GET` | `/api/v1/admin/audit-log` | Get all system audit logs 🔒🛡️ |

### 🏆 [Leaderboard](app/api/v1/leaderboard)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/leaderboard` | Get public leaderboard 🔒 |

### 📢 [Community Posts](app/api/v1/posts)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/posts` | Retrieve paginated feed of published posts 🔒 |
| `GET` | `/api/v1/posts/:id` | Retrieve details of a single post 🔒 |

### 🔔 [Notifications](app/api/v1/notifications)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/notifications` | Get paginated list of own notifications 🔒 |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark a notification as read 🔒 |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all notifications as read 🔒 |
| `DELETE` | `/api/v1/notifications/:id` | Delete a notification 🔒 |

### 💬 [Submission Comments](app/api/v1/submissions)
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/v1/submissions/:id/comments` | Get comment thread on a submission (owner/assigned judge/admin) 🔒 |
| `POST` | `/api/v1/submissions/:id/comments` | Add comment to submission thread (owner/assigned judge/admin) 🔒 |

---

## 🎨 Rank System

| Rank | Badge | Requirement |
|------|-------|-------------|
| **Ronin** | 🥉 | Starting rank |
| **Kenshi** | 🥈 | Complete Ronin-tier tasks |
| **Samurai** | 🥇 | Complete Kenshi-tier tasks |
| **Shogun** | 👑 | Complete Samurai-tier tasks |

---

## 🧪 Testing

```bash
# Run unit & API service tests
npx vitest run

# Run tests in watch mode
npx vitest
```

---

## 🛠️ Development Scripts & Commands

Below is a reference of all `package.json` scripts available in the project:

### Application Lifecycle
* **Start Dev Server**: `npm run dev` (starts Next.js App Router on port 3001)
* **Build Production App**: `npm run build`
* **Start Production Server**: `npm run start` (serves built app on port 3001)
* **Lint Codebase**: `npm run lint`

### Database Management (Drizzle Kit)
* **Push schema directly**: `npm run db:push` (applies schema changes to PostgreSQL)
* **Generate SQL migration**: `npm run db:generate` (generates migration files from schema)
* **Run migrations**: `npm run db:migrate` (applies outstanding migrations)
* **Drizzle Studio**: `npm run db:studio` (launches local database management GUI)

---

## 📄 License

This project is private and maintained by the Journey to Mastery team.

---

<p align="center">
  Built with ❤️ using Next.js 16, Drizzle ORM, and PostgreSQL
</p>

