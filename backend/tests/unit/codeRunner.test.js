import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { codeRunnerService } from "../../src/infrastructure/runner/codeRunnerService.js";

describe("Polyglot CodeRunnerService Unit Tests", () => {
  it("should execute JavaScript Two Sum solution and pass all 3 test cases", async () => {
    const jsCode = `
var twoSum = function(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
};
`;

    const result = await codeRunnerService.execute({
      language: "javascript",
      code: jsCode,
      problemId: "two-sum",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.allPassed, true);
    assert.strictEqual(result.language, "javascript");
    assert.strictEqual(result.results.length, 3);
    assert.ok(result.duration >= 0);
  });

  it("should detect failing test cases for incorrect JavaScript solution", async () => {
    const incorrectJs = `
var twoSum = function(nums, target) {
  return [0, 0]; // Incorrect implementation
};
`;

    const result = await codeRunnerService.execute({
      language: "javascript",
      code: incorrectJs,
      problemId: "two-sum",
    });

    assert.strictEqual(result.allPassed, false);
    assert.strictEqual(result.results.length, 3);
  });

  it("should execute Python Two Sum solution and pass all 3 test cases", async () => {
    const pyCode = `
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []
`;

    const result = await codeRunnerService.execute({
      language: "python",
      code: pyCode,
      problemId: "two-sum",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.allPassed, true);
    assert.strictEqual(result.language, "python");
    assert.strictEqual(result.results.length, 3);
  });

  it("should execute Python Valid Parentheses solution", async () => {
    const pyCode = `
class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping.values():
                stack.append(char)
            elif not stack or stack.pop() != mapping.get(char):
                return False
        return not stack
`;

    const result = await codeRunnerService.execute({
      language: "python",
      code: pyCode,
      problemId: "valid-parentheses",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.allPassed, true);
    assert.strictEqual(result.results.length, 3);
  });

  it("should execute arbitrary JavaScript code and return stdout", async () => {
    const code = `
const greeting = "Hello from ProConnect Sandbox";
console.log(greeting);
`;

    const result = await codeRunnerService.execute({
      language: "javascript",
      code,
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.stdout.includes("Hello from ProConnect Sandbox"));
  });

  it("should handle infinite loops via timeout constraint", async () => {
    const infiniteLoop = `
while (true) {
  // Infinite loop test
}
`;

    const result = await codeRunnerService.execute({
      language: "javascript",
      code: infiniteLoop,
    });

    assert.strictEqual(result.allPassed, false);
    assert.ok(result.stderr || result.error);
  });
});
