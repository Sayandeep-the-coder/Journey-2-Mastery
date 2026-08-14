import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const GET = apiHandler(async (req: Request) => {

  const status = new URL(req.url).searchParams.get("status") || undefined;
  const judgeId = new URL(req.url).searchParams.get("judgeId") || undefined;
  const cursor = new URL(req.url).searchParams.get("cursor") || undefined;
  const limit = parseInt(new URL(req.url).searchParams.get("limit") || "20", 10);
  const result = await adminService.getAllSubmissions({ status, judgeId, cursor, limit });
  return NextResponse.json({ success: true, data: result.items, meta: result.meta });

});
