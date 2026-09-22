import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import { forbidden, badRequest } from "@/lib/utils/apiError";
import * as emailService from "@/lib/services/email.service";

const broadcastSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(300, "Subject is too long"),
  htmlContent: z.string().min(1, "Email body / HTML content is required"),
});

export const POST = apiHandler(async (req: Request) => {
  const admin = await requireAuth(req);
  if (admin.role !== "admin") {
    throw forbidden("Admin access required");
  }

  const json = await req.json();
  const parsed = broadcastSchema.safeParse(json);
  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0]?.message || "Invalid broadcast payload");
  }

  const results = await emailService.broadcastAdminEmail({
    subject: parsed.data.subject,
    htmlContent: parsed.data.htmlContent,
    adminId: admin.id,
  });

  return NextResponse.json({
    success: true,
    data: results,
  });
});
