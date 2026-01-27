import { redis } from "@/lib/redis/client";

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyPrefix: string;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
}

/**
 * Sliding Window Rate Limiter using Redis Sorted Sets
 */
export async function rateLimiter(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const pipeline = redis.pipeline();

    // Remove old entries
    pipeline.zremrangebyscore(key, 0, windowStart);
    // Add current request
    pipeline.zadd(key, now.toString(), `${now}-${Math.random()}`);
    // Count requests in window
    pipeline.zcard(key);
    // Set expiry
    pipeline.pexpire(key, config.windowMs);

    const results = await pipeline.exec();
    const requestCount = (results?.[2]?.[1] as number) || 0;

    if (requestCount > config.maxRequests) {
        const oldestRequest = await redis.zrange(key, 0, 0, "WITHSCORES");
        const retryAfter = oldestRequest[1]
            ? Math.ceil((parseInt(oldestRequest[1]) + config.windowMs - now) / 1000)
            : Math.ceil(config.windowMs / 1000);

        return {
            allowed: false,
            remaining: 0,
            resetTime: now + config.windowMs,
            retryAfter: Math.max(0, retryAfter),
        };
    }

    return {
        allowed: true,
        remaining: config.maxRequests - requestCount,
        resetTime: now + config.windowMs,
    };
}

// Pre-configured limiters
export const authLimiter = (id: string) =>
    rateLimiter(id, {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        keyPrefix: "rl:auth",
    });

export const apiLimiter = (id: string) =>
    rateLimiter(id, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
        keyPrefix: "rl:api",
    });
