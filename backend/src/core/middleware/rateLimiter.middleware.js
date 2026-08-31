/**
 * High-Performance In-Memory Sliding Window Rate Limiter
 * Protects against Brute-Force, DoS, Credential Stuffing, and Resource Exhaustion.
 */

class MemoryRateLimiter {
  constructor(windowMs, maxRequests, message = "Too many requests, please try again later.") {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.hits = new Map(); // IP -> [timestamps]

    // Periodic sweep to prevent memory leaks every 5 minutes
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

  middleware() {
    return (req, res, next) => {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.socket.remoteAddress ||
        "127.0.0.1";

      const now = Date.now();
      const timestamps = this.hits.get(ip) || [];
      const windowStart = now - this.windowMs;

      // Filter out timestamps older than the sliding window
      const validTimestamps = timestamps.filter((t) => t > windowStart);

      const remaining = Math.max(0, this.maxRequests - validTimestamps.length);
      const resetTime = Math.ceil((windowStart + this.windowMs - now) / 1000);

      // Set standard RFC rate limit headers
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
    };
  }
}

// 1. Strict Auth Limiter: 15 requests per 15 minutes (Login, Register, Reset)
export const authRateLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  15,
  "Too many authentication attempts from this IP. Please wait 15 minutes before retrying."
).middleware();

// 2. General API Limiter: 300 requests per 15 minutes
export const generalApiLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  300,
  "API rate limit exceeded. Please slow down your requests."
).middleware();

// 3. AI Coach / Simulator Limiter: 25 requests per 15 minutes
export const aiRateLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  25,
  "AI generation quota reached for this window. Please wait a few minutes."
).middleware();

// 4. Creation/Post Limiter: 60 requests per 15 minutes (Anti-spam)
export const writeRateLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  60,
  "Posting frequency limit reached. Please wait before creating more content."
).middleware();
