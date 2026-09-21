import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { db } from "@/lib/db/client";
import { users, submissions } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { notFound } from "@/lib/utils/apiError";
import type { Rank, TeamType } from "@/types/api.types";

function resolveMartialRank(score: number, rank?: string): Rank {
  if (rank && ["Ronin", "Kenshi", "Samurai", "Shogun"].includes(rank)) {
    return rank as Rank;
  }
  if (score >= 300) return "Shogun";
  if (score >= 200) return "Samurai";
  if (score >= 100) return "Kenshi";
  return "Ronin";
}

function resolveTeamType(memberCount: number): TeamType {
  if (memberCount >= 3) return "trio";
  if (memberCount === 2) return "duo";
  return "solo";
}

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: userId } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      username: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      rank: true,
      score: true,
      bio: true,
      collegeName: true,
      branch: true,
      year: true,
      discord: true,
      githubId: true,
      createdAt: true,
      currentTeamId: true,
    },
    with: {
      team: {
        with: {
          members: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              rank: true,
              role: true,
              teamRole: true,
              score: true,
              bio: true,
              collegeName: true,
              branch: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw notFound("User", userId);
  }

  // Count approved submissions
  const [completedCountResult] = await db
    .select({ count: count() })
    .from(submissions)
    .where(and(eq(submissions.userId, userId), eq(submissions.status, "approved")));

  const pureRank = resolveMartialRank(user.score, user.rank);

  let teamData = null;
  if (user.team) {
    const members = (user.team.members || []).map((m) => ({
      id: m.id,
      userId: m.id,
      username: m.username,
      userName: m.fullName || m.username,
      fullName: m.fullName,
      avatarUrl: m.avatarUrl || undefined,
      rank: resolveMartialRank(m.score, m.rank),
      role: m.role,
      teamRole: (m.teamRole as "leader" | "member") || "member",
      score: m.score,
      bio: m.bio,
      collegeName: m.collegeName,
      branch: m.branch,
    }));

    teamData = {
      id: user.team.id,
      name: user.team.name,
      score: user.team.score,
      memberCount: members.length,
      teamType: resolveTeamType(members.length),
      members,
    };
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      rank: pureRank,
      score: user.score,
      tasksCompleted: completedCountResult?.count ?? 0,
      submissionCount: completedCountResult?.count ?? 0,
      bio: user.bio,
      collegeName: user.collegeName,
      branch: user.branch,
      year: user.year,
      discord: user.discord,
      githubId: user.githubId,
      createdAt: user.createdAt,
      team: teamData,
    },
  });
});
