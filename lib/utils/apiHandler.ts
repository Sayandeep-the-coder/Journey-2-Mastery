import { NextResponse } from "next/server";
import { AppError } from "./apiError";
import { checkRateLimit, rateLimitConfigs } from "../middleware/rateLimit.middleware";
import { ZodError } from "zod";

type ApiHandlerOptions = {
  rateLimitType?: keyof typeof rateLimitConfigs;
};

export function apiHandler(
  handler: (req: Request, ...args: any[]) => Promise<NextResponse | Response>,
  options: ApiHandlerOptions = { rateLimitType: 'public' }
) {
  return async (req: Request, ...args: any[]): Promise<NextResponse | Response> => {
    try {
      // 1. Rate Limiting
      if (options.rateLimitType) {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("remote-addr") || "unknown";
        const url = new URL(req.url);
        const identifier = `${ip}:${url.pathname}`;
        
        await checkRateLimit(identifier, rateLimitConfigs[options.rateLimitType]);
      }

      // 2. Execute Handler
      return await handler(req, ...args);
    } catch (error: unknown) {
      console.error("[API_ERROR]", error);

      // Handle Zod validation errors gracefully
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid input data",
              issues: error.errors
            }
          },
          { status: 400 }
        );
      }

      const err = error as Error & { statusCode?: number; code?: string; isOperational?: boolean };
      const isOperational = error instanceof AppError || err.isOperational;
      const status = err.statusCode || 500;
      
      const message = (!isOperational && status === 500) 
        ? "An unexpected server error occurred." 
        : (err.message || "Internal Server Error");
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message,
            code: err.code || "INTERNAL_ERROR" 
          } 
        }, 
        { status }
      );
    }
  };
}
