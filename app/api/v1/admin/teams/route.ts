import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { requireRole } from "@/lib/middleware/role.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const GET = apiHandler(async (req: Request) => {
  const admin = await requireAuth(req);
  requireRole(admin, ["admin"]);

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);

  const result = await adminService.getTeams({ status, search, page, limit });
  return NextResponse.json({
    success: true,
    data: {
      items: result.items,
      stats: result.stats,
    },
    meta: result.meta,
  });
});
