import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as leaderboardService from "@/lib/services/leaderboard.service";

export const GET = apiHandler(async (req: Request) => {
  const limit = parseInt(new URL(req.url).searchParams.get("limit") || "50", 10);
  const teams = await leaderboardService.getTeamLeaderboard(limit);
  return NextResponse.json({ success: true, data: teams });
});
