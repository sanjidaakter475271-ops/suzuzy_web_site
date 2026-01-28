import Redis from "ioredis";

const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
        enableOfflineQueue: false,
    })
    : null;


/**
 * Check rate limit for a key (e.g. "login:user@example.com")
 * Returns { success: boolean, remaining: number, reset: number }
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
    if (!redis) {
        console.warn("Redis not configured. Skipping rate limit check.");
        return { success: true, remaining: limit, reset: 0 };
    }

    const current = await redis.get(key);
    const count = current ? parseInt(current) : 0;

    if (count >= limit) {
        const ttl = await redis.ttl(key);
        return { success: false, remaining: 0, reset: ttl };
    }

    const multi = redis.multi();
    multi.incr(key);
    if (count === 0) {
        multi.expire(key, windowSeconds);
    }
    await multi.exec();

    return {
        success: true,
        remaining: limit - count - 1,
        reset: count === 0 ? windowSeconds : await redis.ttl(key)
    };
}

/**
 * Reset rate limit for a key
 */
export async function resetRateLimit(key: string) {
    if (redis) {
        await redis.del(key);
    }
}
