import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as judgeService from "@/lib/services/judge.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const cursor = url.searchParams.get("cursor") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const email = url.searchParams.get("email") || url.searchParams.get("search") || undefined;
  const result = await judgeService.getAssignedSubmissions(user.id, status, cursor, limit, email);
  return NextResponse.json({ success: true, data: result.items, meta: result.meta });

});
