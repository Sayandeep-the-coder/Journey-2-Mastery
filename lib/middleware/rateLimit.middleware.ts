import { redis } from "../config/redis";
import { tooManyRequests } from "../utils/apiError";
import { env } from "../config/env";

export type RateLimitConfig = {
  max: number;
  windowMs: number;
};

/**
 * Creates a rate limiter function that checks Redis.
 * Uses a simple sliding window counter using Redis EXPIRE.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
) {
  const key = `ratelimit:${identifier}`;
  const current = await redis.incr(key);

  if (current === 1) {
    // Set expiry on first request
    await redis.pexpire(key, config.windowMs);
  }

  if (current > config.max) {
    // Determine backoff (e.g. exponential based on current count beyond max)
    // If it's a severe breach, we can increase the expiry (exponential backoff)
    if (current > config.max * 2) {
       await redis.pexpire(key, config.windowMs * 2);
    }
    throw tooManyRequests(`Rate limit exceeded. Please try again later.`);
  }

  return {
    remaining: Math.max(0, config.max - current),
    resetTime: Date.now() + config.windowMs,
  };
}

export const rateLimitConfigs = {
  auth: { max: env.RATE_LIMIT_GITHUB_MAX || 10, windowMs: env.RATE_LIMIT_WINDOW_MS || 60000 },
  public: { max: env.RATE_LIMIT_MAX || 100, windowMs: env.RATE_LIMIT_WINDOW_MS || 60000 },
  authenticated: { max: (env.RATE_LIMIT_MAX || 100) * 5, windowMs: env.RATE_LIMIT_WINDOW_MS || 60000 },
};
