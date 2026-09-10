import { getRedisClient, isRedisReady } from "../../infrastructure/redis/redisClient.js";

/**
 * Hybrid Production Rate Limiter (Redis Sliding Window with In-Memory Fallback)
 * 
 * Ponytail Principles:
 * - Lazy & Resilient: Uses atomic Redis Sorted Sets (ZADD/ZREMRANGEBYSCORE/ZCARD) when ready.
 * - Automatic Fallback: Instantly falls back to MemoryRateLimiter if Redis is unavailable.
 * - Zero Stale Data: Keys use auto-expiring TTLs (pExpire) and store only timestamps, never DB entities.
 */

class MemoryRateLimiter {
  constructor(windowMs, maxRequests, message) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.hits = new Map(); // IP -> [timestamps]

    // Sweep stale memory entries every 5 minutes to prevent memory leaks
    setInterval(() => {
      const now = Date.now();
      for (const [ip, timestamps] of this.hits.entries()) {
        const valid = timestamps.filter((t) => now - t < this.windowMs);
        if (valid.length === 0) {
          this.hits.delete(ip);
        } else {
          this.hits.set(ip, valid);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  handle(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    const now = Date.now();
    const timestamps = this.hits.get(ip) || [];
    const windowStart = now - this.windowMs;

    const validTimestamps = timestamps.filter((t) => t > windowStart);
    const remaining = Math.max(0, this.maxRequests - validTimestamps.length);
    const resetTime = Math.ceil((windowStart + this.windowMs - now) / 1000);

    res.setHeader("X-RateLimit-Limit", this.maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetTime > 0 ? resetTime : 0);

    if (validTimestamps.length >= this.maxRequests) {
      res.setHeader("Retry-After", resetTime > 0 ? resetTime : 1);
      return res.status(429).json({
        success: false,
        message: this.message,
        retryAfterSeconds: resetTime > 0 ? resetTime : 1,
      });
    }

    validTimestamps.push(now);
    this.hits.set(ip, validTimestamps);
    next();
  }
}

class HybridRateLimiter {
  constructor({ name, windowMs, maxRequests, message }) {
    this.name = name;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message || "Too many requests, please try again later.";
    this.memoryLimiter = new MemoryRateLimiter(this.windowMs, this.maxRequests, this.message);
  }

  middleware() {
    return async (req, res, next) => {
      const redis = getRedisClient();

      // If Redis is not ready, execute immediately with in-memory limiter
      if (!redis || !isRedisReady()) {
        return this.memoryLimiter.handle(req, res, next);
      }

      const ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";
      const sanitizedIp = ip.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const key = `ratelimit:${this.name}:${sanitizedIp}`;
      const now = Date.now();
      const windowStart = now - this.windowMs;
      const member = `${now}:${Math.random().toString(36).substring(2, 8)}`;

      try {
        // Atomic sliding window via Redis transaction
        const multi = redis.multi();
        multi.zRemRangeByScore(key, 0, windowStart);
        multi.zAdd(key, [{ score: now, value: member }]);
        multi.zCard(key);
        multi.pExpire(key, this.windowMs);

        const results = await multi.exec();
        // results format from node-redis: [remCount, addCount, zcardCount, pexpireResult]
        const currentCount = Number(results[2]) || 1;

        const remaining = Math.max(0, this.maxRequests - currentCount);
        const resetSeconds = Math.ceil(this.windowMs / 1000);

        res.setHeader("X-RateLimit-Limit", this.maxRequests);
        res.setHeader("X-RateLimit-Remaining", remaining);
        res.setHeader("X-RateLimit-Reset", resetSeconds);

        if (currentCount > this.maxRequests) {
          res.setHeader("Retry-After", resetSeconds);
          return res.status(429).json({
            success: false,
            message: this.message,
            retryAfterSeconds: resetSeconds,
          });
        }

        next();
      } catch (err) {
        // In case of any Redis socket error or timeout, safely fall back to memory limiter
        return this.memoryLimiter.handle(req, res, next);
      }
    };
  }
}

// 1. Strict Auth Limiter: 15 requests per 15 minutes (Login, Register, Reset)
export const authRateLimiter = new HybridRateLimiter({
  name: "auth",
  windowMs: 15 * 60 * 1000,
  maxRequests: 15,
  message: "Too many authentication attempts from this IP. Please wait 15 minutes before retrying.",
}).middleware();

// 2. General API Limiter: 300 requests per 15 minutes
export const generalApiLimiter = new HybridRateLimiter({
  name: "general",
  windowMs: 15 * 60 * 1000,
  maxRequests: 300,
  message: "API rate limit exceeded. Please slow down your requests.",
}).middleware();

// 3. AI Coach / Simulator Limiter: 25 requests per 15 minutes
export const aiRateLimiter = new HybridRateLimiter({
  name: "ai",
  windowMs: 15 * 60 * 1000,
  maxRequests: 25,
  message: "AI generation quota reached for this window. Please wait a few minutes.",
}).middleware();

// 4. Creation/Post Limiter: 60 requests per 15 minutes (Anti-spam)
export const writeRateLimiter = new HybridRateLimiter({
  name: "write",
  windowMs: 15 * 60 * 1000,
  maxRequests: 60,
  message: "Posting frequency limit reached. Please wait before creating more content.",
}).middleware();
