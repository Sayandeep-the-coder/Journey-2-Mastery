import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { requireRole } from "@/lib/middleware/role.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireAuth(req);
  requireRole(admin, ["admin"]);

  const { id } = await params;
  const result = await adminService.disbandTeamAsAdmin(id, admin.id);
  return NextResponse.json({ success: true, data: result });
});
