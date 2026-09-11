import { getRedisClient, isRedisReady } from "../redis/redisClient.js";
import logger from "../logger/logger.js";

// ───────────────────────────────────────────────────────────
// Resilient Cache-Aside Engine with Telemetry & Pattern Eviction
// ───────────────────────────────────────────────────────────

export class CacheService {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.inMemoryCache = new Map(); // Resilient fallback if Redis is down
  }

  /**
   * Get cached data by key.
   * Returns { data, fromCache: true } on hit, or null on miss.
   */
  async get(key) {
    const redis = getRedisClient();

    if (redis && isRedisReady()) {
      try {
        const raw = await redis.get(key);
        if (raw !== null) {
          this.hits++;
          return { data: JSON.parse(raw), fromCache: true };
        }
      } catch (err) {
        logger.warn("Redis cache read error, checking memory fallback", { error: err.message, key });
      }
    } else {
      // Memory fallback check
      const memEntry = this.inMemoryCache.get(key);
      if (memEntry) {
        if (memEntry.expiresAt > Date.now()) {
          this.hits++;
          return { data: memEntry.data, fromCache: true };
        }
        this.inMemoryCache.delete(key);
      }
    }

    this.misses++;
    return null;
  }

  /**
   * Store data in cache with TTL in seconds.
   */
  async set(key, value, ttlSeconds = 60) {
    const redis = getRedisClient();
    const serialized = JSON.stringify(value);

    if (redis && isRedisReady()) {
      try {
        await redis.set(key, serialized, { EX: ttlSeconds });
        return true;
      } catch (err) {
        logger.warn("Redis cache write error, writing to memory fallback", { error: err.message, key });
      }
    }

    // Memory fallback storage
    this.inMemoryCache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return true;
  }

  /**
   * Delete a specific key from cache.
   */
  async del(key) {
    const redis = getRedisClient();

    if (redis && isRedisReady()) {
      try {
        await redis.del(key);
      } catch (err) {
        logger.warn("Redis cache delete error", { error: err.message, key });
      }
    }

    this.inMemoryCache.delete(key);
    return true;
  }

  /**
   * Pattern-based cache invalidation (e.g., 'cache:feed:*', 'cache:profile:*').
   * In Redis, uses SCAN to avoid blocking the event loop on production clusters.
   */
  async delPattern(pattern) {
    const redis = getRedisClient();

    // 1. Invalidate matching memory keys
    const regexPattern = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const k of this.inMemoryCache.keys()) {
      if (regexPattern.test(k)) {
        this.inMemoryCache.delete(k);
      }
    }

    // 2. Invalidate matching Redis keys using non-blocking SCAN
    if (redis && isRedisReady()) {
      try {
        let cursor = 0;
        let deletedTotal = 0;

        do {
          const reply = await redis.scan(cursor, {
            MATCH: pattern,
            COUNT: 100,
          });

          cursor = reply.cursor;
          const keys = reply.keys;

          if (keys && keys.length > 0) {
            await redis.del(keys);
            deletedTotal += keys.length;
          }
        } while (cursor !== 0);

        logger.debug("Invalidated cache pattern", { pattern, deletedCount: deletedTotal });
        return deletedTotal;
      } catch (err) {
        logger.warn("Redis pattern invalidation failed", { error: err.message, pattern });
      }
    }

    return 0;
  }

  /**
   * Cache telemetry metrics
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRatioPercent = total > 0 ? ((this.hits / total) * 100).toFixed(2) + "%" : "0.00%";
    return {
      hits: this.hits,
      misses: this.misses,
      totalRequests: total,
      hitRatio: hitRatioPercent,
      memoryFallbackSize: this.inMemoryCache.size,
    };
  }

  /**
   * Reset stats (useful for testing)
   */
  resetStats() {
    this.hits = 0;
    this.misses = 0;
    this.inMemoryCache.clear();
  }
}

export const cacheService = new CacheService();
export default cacheService;
