import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as githubService from "@/lib/services/github.service";

export const GET = apiHandler(async (req: Request) => {

  const user = await requireAuth(req);
  const url = new URL(req.url);
  const refresh = url.searchParams.get("refresh") === "true";
  const repos = await githubService.getUserRepos(user.id, refresh);
  return NextResponse.json({ success: true, data:  repos });

});
