import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as userService from "@/lib/services/user.service";

export const GET = apiHandler(async (req: Request) => {
  await requireAuth(req);
  const categories = await userService.getTaskCategories();
  return NextResponse.json({ success: true, data: categories });
});
