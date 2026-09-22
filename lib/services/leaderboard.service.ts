import { sql } from "drizzle-orm";
import { db } from "../db/client";
import { redis } from "../config/redis";
import { CACHE_KEYS } from "../utils/constants";
import { logger } from "../logger";

import { desc, inArray, eq } from "drizzle-orm";
import { users, teams } from "../db/schema";
import type { TeamType, Rank } from "@/types/api.types";

export interface LeaderboardMemberItem {
  id: string;
  userId: string;
  username: string;
  userName: string;
  fullName: string | null;
  avatarUrl: string | null;
  rank: Rank;
  role: string;
  teamRole: "leader" | "member" | null;
  score: number;
  bio?: string | null;
  collegeName?: string | null;
  branch?: string | null;
  discord?: string | null;
}

export interface EnrichedLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  score: number;
  tasksCompleted: number;
  userRank: Rank;
  teamType: TeamType;
  teamName: string | null;
  teamId: string | null;
  teamMembers: LeaderboardMemberItem[];
}

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

/**
 * Get the live leaderboard from the database view enriched with team status and pure martial rank.
 * Computed on the fly — always returns real-time scores.
 */
export async function getLeaderboard(
  cursor?: string,
  limit = 200
): Promise<{ items: EnrichedLeaderboardEntry[]; meta: { nextCursor: string | null; limit: number } }> {
  try {
    const conditions = cursor
      ? sql`WHERE user_id > ${cursor}`
      : sql``;

    const rows = await db.execute(
      sql`SELECT user_id, username, full_name, avatar_url, rank, total_score, tasks_completed, entity_type, leaderboard_rank
          FROM leaderboard
          ${conditions}
          ORDER BY total_score DESC, username ASC
          LIMIT ${limit + 1}`
    );

    const rawList = rows as unknown as Array<Record<string, unknown>>;
    const hasMore = rawList.length > limit;
    const selectedRows = hasMore ? rawList.slice(0, limit) : rawList;

    if (selectedRows.length === 0) {
      return { items: [], meta: { nextCursor: null, limit } };
    }

    const soloUserIds = selectedRows
      .filter((r) => r.entity_type === "solo" || !r.entity_type)
      .map((r) => r.user_id as string);

    const teamIds = selectedRows
      .filter((r) => r.entity_type === "team")
      .map((r) => r.user_id as string);

    // Fetch solo users with their teams and team members
    const userRecords = soloUserIds.length > 0
      ? await db.query.users.findMany({
          where: inArray(users.id, soloUserIds),
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
            discord: true,
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
                    discord: true,
                  },
                },
              },
            },
          },
        })
      : [];

    const userMap = new Map(userRecords.map((u) => [u.id, u]));

    // Fetch team records with members
    const teamRecords = teamIds.length > 0
      ? await db.query.teams.findMany({
          where: inArray(teams.id, teamIds),
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
                discord: true,
              },
            },
          },
        })
      : [];

    const teamMap = new Map(teamRecords.map((t) => [t.id, t]));

    const items: EnrichedLeaderboardEntry[] = selectedRows.map((row) => {
      const isTeam = row.entity_type === "team";
      const score = Number(row.total_score || 0);
      const pureRank = resolveMartialRank(score, row.rank as string);

      if (isTeam) {
        const team = teamMap.get(row.user_id as string);
        const members: LeaderboardMemberItem[] = (team?.members || []).map((m) => ({
          id: m.id,
          userId: m.id,
          username: m.username,
          userName: m.fullName || m.username,
          fullName: m.fullName,
          avatarUrl: m.avatarUrl,
          rank: resolveMartialRank(m.score, m.rank),
          role: m.role,
          teamRole: (m.teamRole as "leader" | "member") || "member",
          score: m.score,
          bio: m.bio,
          collegeName: m.collegeName,
          branch: m.branch,
          discord: m.discord,
        }));
        const count = members.length;

        return {
          rank: Number(row.leaderboard_rank),
          userId: row.user_id as string,
          userName: (row.full_name as string | null) || (row.username as string),
          avatarUrl: row.avatar_url as string | null,
          score,
          tasksCompleted: Number(row.tasks_completed || 0),
          userRank: pureRank,
          teamType: resolveTeamType(count),
          teamName: (row.username as string) || team?.name || null,
          teamId: row.user_id as string,
          teamMembers: members,
        };
      } else {
        const user = userMap.get(row.user_id as string);
        const warriorName =
          (row.full_name as string | null) ||
          user?.fullName ||
          (row.username as string) ||
          user?.username ||
          "Solo Warrior";

        const selfMember: LeaderboardMemberItem = {
          id: row.user_id as string,
          userId: row.user_id as string,
          username: (row.username as string) || user?.username || "",
          userName: warriorName,
          fullName: (row.full_name as string | null) || user?.fullName || null,
          avatarUrl: (row.avatar_url as string | null) || user?.avatarUrl || null,
          rank: pureRank,
          role: user?.role || "user",
          teamRole: "leader",
          score,
          bio: user?.bio,
          collegeName: user?.collegeName,
          branch: user?.branch,
          discord: user?.discord,
        };

        return {
          rank: Number(row.leaderboard_rank),
          userId: row.user_id as string,
          userName: warriorName,
          avatarUrl: (row.avatar_url as string | null) || user?.avatarUrl || null,
          score,
          tasksCompleted: Number(row.tasks_completed || 0),
          userRank: pureRank,
          teamType: "solo",
          teamName: warriorName,
          teamId: null,
          teamMembers: [selfMember],
        };
      }
    });

    return {
      items,
      meta: {
        nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.userId : null,
        limit,
      },
    };
  } catch (err) {
    logger.error({ err }, "Error getting enriched leaderboard");
    return { items: [], meta: { nextCursor: null, limit } };
  }
}

/**
 * Get clan/team leaderboard rankings with all members and pure ranks.
 */
export async function getTeamLeaderboard(limit = 50) {
  try {
    const allTeams = await db.query.teams.findMany({
      orderBy: [desc(teams.score)],
      limit,
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
            discord: true,
          },
        },
      },
    });

    return allTeams.map((team, idx) => {
      const members = (team.members || []).map((m) => ({
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
        discord: m.discord,
      }));

      return {
        rank: idx + 1,
        teamId: team.id,
        teamName: team.name,
        score: team.score,
        memberCount: members.length,
        teamType: resolveTeamType(members.length),
        members,
      };
    });
  } catch (err) {
    logger.error({ err }, "Error getting team leaderboard");
    return [];
  }
}

/**
 * Legacy refresh function kept for backwards compatibility.
 * The leaderboard is now a live view so no refresh is needed.
 * Just clears any leftover Redis cache key.
 */
export async function refreshLeaderboard(): Promise<void> {
  try {
    await redis.del(CACHE_KEYS.leaderboard);
    logger.info("Leaderboard refresh called (no-op — live view)");
  } catch (err) {
    logger.error({ err }, "Failed during leaderboard refresh");
    throw err;
  }
}

