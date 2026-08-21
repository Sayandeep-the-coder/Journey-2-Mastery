import { sql } from "drizzle-orm";
import { db } from "../db/client";
import { redis } from "../config/redis";
import { CACHE_KEYS } from "../utils/constants";
import { logger } from "../logger";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  score: number;
  tasksCompleted: number;
  userRank: string;
}

/**
 * Get the live leaderboard from the database view.
 * Computed on the fly — always returns real-time scores.
 */
export async function getLeaderboard(
  cursor?: string,
  limit = 20
): Promise<{ items: LeaderboardEntry[]; meta: { nextCursor: string | null; limit: number } }> {
  try {
    // Query the live view directly — no cache
    const conditions = cursor
      ? sql`WHERE user_id > ${cursor}`
      : sql``;

    const rows = await db.execute(
      sql`SELECT user_id, username, full_name, avatar_url, rank, total_score, tasks_completed, leaderboard_rank
          FROM leaderboard
          ${conditions}
          ORDER BY total_score DESC, user_id ASC
          LIMIT ${limit + 1}`
    );

    const entries: LeaderboardEntry[] = (rows as unknown as Array<Record<string, unknown>>).map((row) => ({
      rank: Number(row.leaderboard_rank),
      userId: row.user_id as string,
      userName: (row.full_name as string | null) || (row.username as string),
      avatarUrl: row.avatar_url as string | null,
      score: Number(row.total_score),
      tasksCompleted: Number(row.tasks_completed),
      userRank: row.rank as string,
    }));

    const hasMore = entries.length > limit;
    const items = hasMore ? entries.slice(0, limit) : entries;

    return {
      items,
      meta: {
        nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.userId : null,
        limit,
      },
    };
  } catch (err) {
    // View might not exist yet
    logger.warn({ err }, "Leaderboard view query failed — view may not exist yet");
    return { items: [], meta: { nextCursor: null, limit } };
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

