import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as authService from "@/lib/services/auth.service";
import { refreshTokenSchema } from "@/lib/validators/auth.validator";
import { badRequest } from "@/lib/utils/apiError";

export const POST = apiHandler(async (req: Request) => {

  const rawBody = await req.json();
  const parsed = refreshTokenSchema.safeParse(rawBody);
  
  if (!parsed.success) {
    throw badRequest("Invalid refresh token payload");
  }

  const body = parsed.data;
  const tokens = await authService.refreshAccessToken(body.refreshToken);

  return NextResponse.json({ success: true, data:  {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  } });

}, { rateLimitType: 'auth' });
