import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as userService from "@/lib/services/user.service";
import { taskFilterSchema } from "@/lib/validators/user.validator";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const rawFilters = Object.fromEntries(new URL(req.url).searchParams);
  const filters = taskFilterSchema.parse(rawFilters);
  const result = await userService.getAvailableTasks(user.id, filters);
  return NextResponse.json({ success: true, data: result.items, meta: result.meta });

});
