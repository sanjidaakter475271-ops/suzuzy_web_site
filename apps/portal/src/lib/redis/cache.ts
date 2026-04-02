import { redis } from "./client";

/**
 * Gets a value from Redis cache or fetches and sets it if not found/expired.
 *
 * @param key The unique cache key (should typically include dealerId)
 * @param ttlSeconds Time-to-live in seconds
 * @param fetcher Function that returns the data if cache miss occurs
 * @returns The cached or freshly fetched data
 */
export async function getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
): Promise<T> {
    try {
        const cachedValue = await redis.get(key);

        if (cachedValue) {
            return JSON.parse(cachedValue) as T;
        }

        const freshData = await fetcher();

        // Cache the fresh data
        if (freshData !== undefined && freshData !== null) {
            await redis.set(key, JSON.stringify(freshData), "EX", ttlSeconds);
        }

        return freshData;
    } catch (error) {
        console.error(`[Redis Cache Error] Key: ${key}`, error);
        // Fallback to fetcher if Redis fails
        return await fetcher();
    }
}

/**
 * Invalidates a specific cache key
 */
export async function invalidateCache(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch (error) {
        console.error(`[Redis Cache Invalidate Error] Key: ${key}`, error);
    }
}

/**
 * Invalidates all keys matching a specific pattern (e.g. "tenant:123:*")
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error(`[Redis Cache Pattern Invalidate Error] Pattern: ${pattern}`, error);
    }
}

/**
 * Generates a consistent cache key for dealer-specific data
 */
export function generateDealerCacheKey(dealerId: string, resource: string, params?: Record<string, any>): string {
    const baseKey = `tenant:${dealerId}:${resource}`;
    if (!params || Object.keys(params).length === 0) {
        return baseKey;
    }
    const paramString = Object.entries(params)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    return `${baseKey}:${paramString}`;
}
