import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";
import { z } from "zod";

const toggleSchema = z.object({
  isActive: z.boolean(),
});

export const POST = apiHandler(async (req: Request) => {
  const admin = await requireAuth(req);
  const body = toggleSchema.parse(await req.json());
  
  const count = await adminService.toggleAllTasks(admin.id, body.isActive);
  
  return NextResponse.json({ success: true, data: { count } });
});
