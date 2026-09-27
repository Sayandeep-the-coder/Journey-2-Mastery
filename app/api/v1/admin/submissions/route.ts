import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const GET = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const judgeId = url.searchParams.get("judgeId") || undefined;
  const userId = url.searchParams.get("userId") || undefined;
  const taskId = url.searchParams.get("taskId") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const cursor = url.searchParams.get("cursor") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const result = await adminService.getAllSubmissions({
    status,
    judgeId,
    userId,
    taskId,
    search,
    cursor,
    limit,
  });
  return NextResponse.json({ success: true, data: result.items, meta: result.meta });
});
