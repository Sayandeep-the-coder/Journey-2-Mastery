import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {
  const admin = await requireAuth(req);
  const submissionId = (await params).id;
  const body = (await req.json().catch(() => ({}))) as {
    judgeId?: string;
    auto?: boolean;
    unassign?: boolean;
  };

  if (body.unassign) {
    const result = await adminService.unassignJudge(admin.id, submissionId);
    return NextResponse.json({
      success: true,
      data: { message: "Judge unassigned", ...result },
    });
  }

  if (body.auto || !body.judgeId) {
    const result = await adminService.adminAutoAssign(admin.id, submissionId);
    return NextResponse.json({
      success: true,
      data: { message: "Judge auto-assigned successfully", ...result },
    });
  }

  const result = await adminService.manualAssign(admin.id, submissionId, {
    judgeId: body.judgeId,
  });
  return NextResponse.json({
    success: true,
    data: { message: "Judge assigned successfully", ...result },
  });
});
