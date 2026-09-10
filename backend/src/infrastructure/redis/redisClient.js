import { createClient } from "redis";
import { ENV } from "../../config/env.js";

/**
 * Resilient, Non-Blocking Redis Client Singleton using official 'redis' package.
 * Adheres to Ponytail principles:
 * - Lazy connection (never crashes the server if Redis is down)
 * - Safe error handling (catches ECONNREFUSED without unhandled rejections)
 * - Clean status detection for graceful fallbacks
 * - Zero stale data: purely operational (rate limiting, health), no entity caching
 */
class RedisClientManager {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.hasLoggedOfflineNotice = false;
    this.isConnecting = false;
  }

  getClient() {
    if (this.client) return this.client;

    if (!ENV.REDIS_ENABLED) {
      console.log("[Redis] Redis is disabled via REDIS_ENABLED=false. Using in-memory fallback.");
      return null;
    }

    // Build URL string for official redis package
    let redisUrl = ENV.REDIS_URL;
    if (!redisUrl) {
      const authPart = ENV.REDIS_PASSWORD ? `:${encodeURIComponent(ENV.REDIS_PASSWORD)}@` : "";
      redisUrl = `redis://${authPart}${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`;
    }

    try {
      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 4000,
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              if (!this.hasLoggedOfflineNotice) {
                console.warn("[Redis] Maximum reconnect retries reached. Active in-memory fallback in use.");
                this.hasLoggedOfflineNotice = true;
              }
              // Stop retrying to prevent continuous error logs / CPU usage
              return new Error("Redis reconnect limit reached. Operating in fallback mode.");
            }
            // Exponential backoff capped at 2 seconds
            return Math.min(retries * 200, 2000);
          },
        },
      });

      this.client.on("connect", () => {
        this.hasLoggedOfflineNotice = false;
        let displayTarget = `${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`;
        try {
          if (ENV.REDIS_URL) {
            const parsed = new URL(ENV.REDIS_URL);
            displayTarget = `${parsed.hostname}:${parsed.port || (parsed.protocol === "rediss:" ? 6379 : 6379)}`;
          }
        } catch {
          // fallback to displayTarget
        }
        console.log(`[Redis] Connecting to Redis at ${displayTarget}...`);
      });

      this.client.on("ready", () => {
        this.isReady = true;
        this.hasLoggedOfflineNotice = false;
        console.log("[Redis] Connected and ready.");
      });

      this.client.on("error", (err) => {
        this.isReady = false;
        // Suppress repeating ECONNREFUSED logs to keep console clean
        if (!this.hasLoggedOfflineNotice && (err?.code === "ECONNREFUSED" || err?.message?.includes("ECONNREFUSED"))) {
          console.warn("[Redis] Redis instance not reachable. Operating with resilient in-memory fallback.");
          this.hasLoggedOfflineNotice = true;
        }
      });

      this.client.on("end", () => {
        this.isReady = false;
      });

      return this.client;
    } catch (err) {
      console.warn("[Redis] Initialization error:", err.message);
      this.client = null;
      this.isReady = false;
      return null;
    }
  }

  async connect() {
    const client = this.getClient();
    if (!client || this.isReady || this.isConnecting) return;

    this.isConnecting = true;
    try {
      await client.connect();
    } catch (err) {
      // Caught here so server startup is never blocked or crashed
      this.isReady = false;
    } finally {
      this.isConnecting = false;
    }
  }

  async ping() {
    if (!this.client || !this.isReady) return false;
    try {
      const res = await this.client.ping();
      return res === "PONG";
    } catch {
      return false;
    }
  }

  getStatus() {
    if (!ENV.REDIS_ENABLED) return "disabled";
    if (this.isReady) return "connected";
    return "disconnected (in-memory fallback active)";
  }

  async disconnect() {
    if (this.client) {
      try {
        if (this.client.isOpen) {
          await this.client.quit();
        }
      } catch {
        // Safe discard
      } finally {
        this.client = null;
        this.isReady = false;
      }
    }
  }
}

export const redisManager = new RedisClientManager();
export const getRedisClient = () => redisManager.getClient();
export const connectRedis = () => redisManager.connect();
export const isRedisReady = () => redisManager.isReady;
export const getRedisStatus = () => redisManager.getStatus();
