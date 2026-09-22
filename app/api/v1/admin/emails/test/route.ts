import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import { forbidden, badRequest } from "@/lib/utils/apiError";
import * as emailService from "@/lib/services/email.service";

const testEmailSchema = z.object({
  to: z.string().email("A valid recipient email is required"),
  subject: z.string().min(1, "Subject is required").max(300, "Subject is too long"),
  htmlContent: z.string().min(1, "Email body / HTML content is required"),
});

export const POST = apiHandler(async (req: Request) => {
  const admin = await requireAuth(req);
  if (admin.role !== "admin") {
    throw forbidden("Admin access required");
  }

  const json = await req.json();
  const parsed = testEmailSchema.safeParse(json);
  if (!parsed.success) {
    throw badRequest(parsed.error.errors[0]?.message || "Invalid test email payload");
  }

  const result = await emailService.sendTestEmail({
    to: parsed.data.to,
    subject: parsed.data.subject,
    htmlContent: parsed.data.htmlContent,
  });

  return NextResponse.json({
    success: true,
    data: result,
  });
});
