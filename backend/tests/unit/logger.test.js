import { describe, it } from "node:test";
import assert from "node:assert/strict";
import logger, { generateCorrelationId } from "../../src/infrastructure/logger/logger.js";

describe("Logger & Tracing Unit Tests", () => {
  it("should generate a unique 8-character correlation ID", () => {
    const cid1 = generateCorrelationId();
    const cid2 = generateCorrelationId();

    assert.strictEqual(typeof cid1, "string");
    assert.strictEqual(cid1.length, 8);
    assert.notStrictEqual(cid1, cid2, "Correlation IDs must be unique");
  });

  it("should log info and debug messages without throwing", () => {
    assert.doesNotThrow(() => {
      logger.info("Test info log message", { correlationId: "test1234", testMeta: true });
      logger.warn("Test warn log message", { correlationId: "test1234" });
    });
  });

  it("should log errors with error objects", () => {
    assert.doesNotThrow(() => {
      logger.error("Test error message", {
        correlationId: "test1234",
        error: new Error("Test intentional error").message,
      });
    });
  });
});
