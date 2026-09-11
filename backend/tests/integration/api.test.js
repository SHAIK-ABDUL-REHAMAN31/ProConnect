import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../src/app.js";

describe("API Integration Tests", () => {
  it("GET / should return 200 with service metadata and documentation link", async () => {
    const res = await request(app).get("/");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.version, "2.0.0");
    assert.strictEqual(res.body.documentation, "/api/docs");
  });

  it("GET /health should return 200 with health metrics", async () => {
    const res = await request(app).get("/health");
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.status, "status field must exist");
    assert.strictEqual(res.body.service, "ProConnect Backend API");
  });

  it("GET /ping should return 200 pong", async () => {
    const res = await request(app).get("/ping");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, "pong");
  });

  it("GET /api/docs.json should serve OpenAPI 3.0 specification", async () => {
    const res = await request(app).get("/api/docs.json");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.openapi, "3.0.0");
    assert.ok(res.body.paths, "OpenAPI spec must define paths");
    assert.ok(res.body.paths["/auth/login"], "Spec must define /auth/login");
    assert.ok(res.body.paths["/auth/refresh"], "Spec must define /auth/refresh");
  });

  it("POST /api/v1/auth/register should reject empty payload with 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({});

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it("POST /api/v1/auth/login should reject missing password with 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "random@example.com" });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it("POST /api/v1/auth/refresh should reject missing token with 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .send({});

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  it("POST /api/v1/auth/refresh should reject invalid token with 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: "invalid.jwt.token" });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it("GET /api/v1/auth/me should reject unauthenticated request with 401 Unauthorized", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it("POST /api/v1/posts should reject unauthenticated creation with 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/v1/posts")
      .send({ body: "Unauthorized post attempt" });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it("POST /api/v1/codecollab/execute should run code and return structured evaluation", async () => {
    const res = await request(app)
      .post("/api/v1/codecollab/execute")
      .send({
        language: "javascript",
        problemId: "two-sum",
        code: `var twoSum = function(nums, target) {
          const map = new Map();
          for (let i = 0; i < nums.length; i++) {
            const diff = target - nums[i];
            if (map.has(diff)) return [map.get(diff), i];
            map.set(nums[i], i);
          }
          return [];
        };`,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.allPassed, true);
    assert.strictEqual(res.body.data.language, "javascript");
    assert.strictEqual(res.body.data.results.length, 3);
  });
});

