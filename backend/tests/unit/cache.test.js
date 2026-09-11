import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { CacheService } from "../../src/infrastructure/cache/cacheService.js";

describe("CacheService Unit Tests (Resilient Memory Fallback & Telemetry)", () => {
  let cache;

  beforeEach(() => {
    cache = new CacheService();
  });

  it("should return null on cache miss and record miss telemetry", async () => {
    const result = await cache.get("nonexistent_key");
    assert.strictEqual(result, null);

    const stats = cache.getStats();
    assert.strictEqual(stats.hits, 0);
    assert.strictEqual(stats.misses, 1);
    assert.strictEqual(stats.totalRequests, 1);
    assert.strictEqual(stats.hitRatio, "0.00%");
  });

  it("should set and retrieve values, recording hit telemetry", async () => {
    const key = "test:user:123";
    const payload = { id: "123", username: "alex", active: true };

    await cache.set(key, payload, 60);

    const result = await cache.get(key);
    assert.ok(result);
    assert.strictEqual(result.fromCache, true);
    assert.deepStrictEqual(result.data, payload);

    const stats = cache.getStats();
    assert.strictEqual(stats.hits, 1);
    assert.strictEqual(stats.misses, 0);
    assert.strictEqual(stats.totalRequests, 1);
    assert.strictEqual(stats.hitRatio, "100.00%");
  });

  it("should accurately compute hit ratio across multiple requests", async () => {
    await cache.set("key1", "val1", 60);

    await cache.get("key1"); // Hit
    await cache.get("key1"); // Hit
    await cache.get("key1"); // Hit
    await cache.get("key2"); // Miss

    const stats = cache.getStats();
    assert.strictEqual(stats.hits, 3);
    assert.strictEqual(stats.misses, 1);
    assert.strictEqual(stats.totalRequests, 4);
    assert.strictEqual(stats.hitRatio, "75.00%");
  });

  it("should delete specific keys", async () => {
    await cache.set("temp_key", "temp_value", 60);
    const before = await cache.get("temp_key");
    assert.ok(before);

    await cache.del("temp_key");
    const after = await cache.get("temp_key");
    assert.strictEqual(after, null);
  });

  it("should invalidate keys matching wildcards via delPattern", async () => {
    await cache.set("cache:feed:50:0", [{ id: 1 }], 60);
    await cache.set("cache:feed:20:0", [{ id: 2 }], 60);
    await cache.set("cache:feed:10:5", [{ id: 3 }], 60);
    await cache.set("cache:profile:john", { username: "john" }, 60);

    // Invalidate all feed cache
    await cache.delPattern("cache:feed:*");

    assert.strictEqual(await cache.get("cache:feed:50:0"), null);
    assert.strictEqual(await cache.get("cache:feed:20:0"), null);
    assert.strictEqual(await cache.get("cache:feed:10:5"), null);

    // Profile cache must remain intact
    const profile = await cache.get("cache:profile:john");
    assert.ok(profile);
    assert.strictEqual(profile.data.username, "john");
  });

  it("should handle expiration TTL properly", async () => {
    // Set 0 or negative TTL to simulate immediate expiration
    cache.inMemoryCache.set("expired_key", {
      data: "old_data",
      expiresAt: Date.now() - 1000,
    });

    const result = await cache.get("expired_key");
    assert.strictEqual(result, null);
    // Should have pruned expired entry
    assert.strictEqual(cache.inMemoryCache.has("expired_key"), false);
  });
});
