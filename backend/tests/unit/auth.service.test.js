import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authService } from "../../src/modules/auth/auth.service.js";
import jwt from "jsonwebtoken";
import { ENV } from "../../src/config/env.js";

describe("AuthService Unit Tests", () => {
  const mockUser = {
    _id: "66f123456789abcdef012345",
    email: "test.engineer@example.com",
    username: "testengineer",
    role: "USER",
  };

  it("should generate valid access and refresh JWT tokens", () => {
    const tokens = authService.generateTokens(mockUser);

    assert.ok(tokens.accessToken, "accessToken should exist");
    assert.ok(tokens.refreshToken, "refreshToken should exist");

    // Verify access token payload
    const decodedAccess = jwt.verify(tokens.accessToken, ENV.JWT_SECRET);
    assert.strictEqual(decodedAccess.id, mockUser._id);
    assert.strictEqual(decodedAccess.email, mockUser.email);
    assert.strictEqual(decodedAccess.username, mockUser.username);
    assert.strictEqual(decodedAccess.role, "USER");

    // Verify refresh token payload
    const decodedRefresh = jwt.verify(tokens.refreshToken, ENV.JWT_REFRESH_SECRET);
    assert.strictEqual(decodedRefresh.id, mockUser._id);
    assert.strictEqual(decodedRefresh.email, mockUser.email);
  });

  it("should hash tokens deterministically using sha256", () => {
    const token = "sample_refresh_token_12345";
    const hash1 = authService.hashToken(token);
    const hash2 = authService.hashToken(token);

    assert.strictEqual(hash1, hash2, "Hashing same token should produce same output");
    assert.strictEqual(hash1.length, 64, "SHA-256 hex string should be 64 characters");
  });

  it("should reject reserved usernames", async () => {
    const reservedNames = ["admin", "root", "support", "help", "api", "proconnect"];

    for (const name of reservedNames) {
      const result = await authService.checkUsername(name);
      assert.strictEqual(result.available, false);
      assert.match(result.message, /reserved/i);
    }
  });

  it("should reject usernames with invalid length or special characters", async () => {
    const shortResult = await authService.checkUsername("ab");
    assert.strictEqual(shortResult.available, false);

    const specialResult = await authService.checkUsername("user@name!");
    assert.strictEqual(specialResult.available, false);
  });

  it("should validate username input presence", async () => {
    await assert.rejects(
      async () => {
        await authService.checkUsername("");
      },
      {
        name: "BadRequestError",
        message: "Username is required.",
      }
    );
  });
});
