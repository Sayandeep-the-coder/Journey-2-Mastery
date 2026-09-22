import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import { forbidden } from "@/lib/utils/apiError";
import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema";
import * as emailService from "@/lib/services/email.service";

export const GET = apiHandler(async (req: Request) => {
  const admin = await requireAuth(req);
  if (admin.role !== "admin") {
    throw forbidden("Admin access required");
  }

  const participants = await emailService.getParticipantUsers();
  const configured = emailService.isEmailConfigured();

  // Fetch recent broadcast logs
  const recentLogs = await db
    .select({
      id: auditLog.id,
      actorId: auditLog.actorId,
      action: auditLog.action,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(eq(auditLog.action, "EMAIL_BROADCAST"))
    .orderBy(desc(auditLog.createdAt))
    .limit(10);

  return NextResponse.json({
    success: true,
    data: {
      recipientCount: participants.length,
      isConfigured: configured,
      recentBroadcasts: recentLogs,
    },
  });
});
