import { NextResponse } from "next/server";

/**
 * Standard success response envelope.
 * Every endpoint returns this shape for consistency.
 */
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Standard error response envelope.
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface PaginationMeta {
  cursor?: string | null;
  nextCursor?: string | null;
  limit: number;
  total?: number;
}

/**
 * Send a success response with consistent envelope.
 */
export function success<T>(data: T, meta?: PaginationMeta, status: number = 200) {
  const body: SuccessResponse<T> = { success: true, data };
  if (meta) {
    body.meta = meta;
  }
  return NextResponse.json(body, { status });
}

/**
 * Send a 201 Created response.
 */
export function created<T>(data: T) {
  return success(data, undefined, 201);
}

/**
 * Send a 202 Accepted response (async jobs).
 */
export function accepted<T>(data: T) {
  return success(data, undefined, 202);
}

/**
 * Send an error response with consistent envelope.
 */
export function error(
  code: string,
  message: string,
  status: number = 400
) {
  const body: ErrorResponse = {
    success: false,
    error: { code, message },
  };
  return NextResponse.json(body, { status });
}
