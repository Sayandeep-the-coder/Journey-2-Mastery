import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";
import { updateTaskSchema } from "@/lib/validators/admin.validator";

export const PATCH = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {

  const admin = await requireAuth(req);
  const taskId = (await params).id;
  const json = await req.json();
  const body = updateTaskSchema.parse(json);
  const task = await adminService.updateTask(admin.id, taskId, body);
  return NextResponse.json({ success: true, data:  task });

});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {

  const admin = await requireAuth(req);
  const taskId = (await params).id;
  await adminService.deleteTask(admin.id, taskId);
  return NextResponse.json({ success: true, data:  { message: "Task deactivated" } });

});
