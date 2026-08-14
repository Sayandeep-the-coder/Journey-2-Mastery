import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";
import { overrideReviewSchema } from "@/lib/validators/admin.validator";

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const reviewId = (await params).id;
  const body = overrideReviewSchema.parse(await req.json());
  const review = await adminService.overrideReview(admin.id, reviewId, body);
  return NextResponse.json({ success: true, data:  review });

});
