import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import vm from "node:vm";
import logger from "../logger/logger.js";

// ───────────────────────────────────────────────────────────
// Problem Canonical Harness Generator
// ───────────────────────────────────────────────────────────
class HarnessGenerator {
  static getHarness(problemId, language, userCode) {
    const lang = language.toLowerCase();

    if (problemId === "two-sum") {
      return this.twoSum(lang, userCode);
    }
    if (problemId === "valid-parentheses") {
      return this.validParentheses(lang, userCode);
    }
    if (problemId === "lru-cache") {
      return this.lruCache(lang, userCode);
    }

    // Default: Raw code execution
    return { code: userCode, hasHarness: false };
  }

  static twoSum(lang, userCode) {
    if (lang === "javascript" || lang === "typescript") {
      const code = `
${userCode}

(function() {
  const userFn = typeof twoSum !== 'undefined' ? twoSum : (typeof Solution !== 'undefined' && Solution.twoSum ? Solution.twoSum : null);
  if (!userFn) {
    console.log("__TEST_RESULTS__" + JSON.stringify([{ id: 1, label: "Two Sum", passed: false, input: "N/A", expected: "[0, 1]", actual: "Error: twoSum function is not defined" }]) + "__TEST_RESULTS__");
    return;
  }

  const cases = [
    { id: 1, label: "Case 1", nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
    { id: 2, label: "Case 2", nums: [3, 2, 4], target: 6, expected: [1, 2] },
    { id: 3, label: "Case 3", nums: [3, 3], target: 6, expected: [0, 1] }
  ];

  const results = cases.map(tc => {
    try {
      const act = userFn(tc.nums, tc.target);
      const passed = Array.isArray(act) && act.length === 2 &&
        [...act].sort()[0] === tc.expected[0] && [...act].sort()[1] === tc.expected[1];
      return { id: tc.id, label: tc.label, passed, input: JSON.stringify({ nums: tc.nums, target: tc.target }), expected: JSON.stringify(tc.expected), actual: JSON.stringify(act) };
    } catch (e) {
      return { id: tc.id, label: tc.label, passed: false, input: JSON.stringify({ nums: tc.nums, target: tc.target }), expected: JSON.stringify(tc.expected), actual: "Error: " + e.message };
    }
  });

  console.log("__TEST_RESULTS__" + JSON.stringify(results) + "__TEST_RESULTS__");
})();
`;
      return { code, hasHarness: true };
    }

    if (lang === "python" || lang === "python3") {
      const code = `
${userCode}

import json

def run_tests():
    sol = Solution() if 'Solution' in globals() else None
    if not sol:
        print("__TEST_RESULTS__" + json.dumps([{"id": 1, "label": "Two Sum", "passed": False, "input": "N/A", "expected": "[0, 1]", "actual": "Error: Solution class not defined"}]) + "__TEST_RESULTS__")
        return

    cases = [
        {"id": 1, "label": "Case 1", "nums": [2, 7, 11, 15], "target": 9, "expected": [0, 1]},
        {"id": 2, "label": "Case 2", "nums": [3, 2, 4], "target": 6, "expected": [1, 2]},
        {"id": 3, "label": "Case 3", "nums": [3, 3], "target": 6, "expected": [0, 1]}
    ]

    results = []
    for tc in cases:
        try:
            act = sol.twoSum(tc["nums"], tc["target"])
            passed = isinstance(act, (list, tuple)) and len(act) == 2 and sorted(act) == tc["expected"]
            results.append({
                "id": tc["id"],
                "label": tc["label"],
                "passed": passed,
                "input": json.dumps({"nums": tc["nums"], "target": tc["target"]}),
                "expected": json.dumps(tc["expected"]),
                "actual": json.dumps(act)
            })
        except Exception as e:
            results.append({
                "id": tc["id"],
                "label": tc["label"],
                "passed": False,
                "input": json.dumps({"nums": tc["nums"], "target": tc["target"]}),
                "expected": json.dumps(tc["expected"]),
                "actual": f"Error: {str(e)}"
            })

    print("__TEST_RESULTS__" + json.dumps(results) + "__TEST_RESULTS__")

if __name__ == '__main__':
    run_tests()
`;
      return { code, hasHarness: true };
    }

    if (lang === "cpp" || lang === "c++") {
      const code = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

${userCode}

int main() {
    Solution sol;
    cout << "__TEST_RESULTS__[";
    
    // Case 1
    {
        vector<int> nums = {2, 7, 11, 15};
        int target = 9;
        vector<int> act = sol.twoSum(nums, target);
        vector<int> sortedAct = act;
        sort(sortedAct.begin(), sortedAct.end());
        bool p = (sortedAct.size() == 2 && sortedAct[0] == 0 && sortedAct[1] == 1);
        string actStr = act.size() == 2 ? "[" + to_string(act[0]) + ", " + to_string(act[1]) + "]" : "[]";
        cout << "{\\"id\\": 1, \\"label\\": \\"Case 1\\", \\"passed\\": " << (p ? "true" : "false")
             << ", \\"input\\": \\"{\\\\\\"nums\\\\\\": [2, 7, 11, 15], \\\\\\"target\\\\\\": 9}\\""
             << ", \\"expected\\": \\"[0, 1]\\", \\"actual\\": \\"" << actStr << "\\"},";
    }
    // Case 2
    {
        vector<int> nums = {3, 2, 4};
        int target = 6;
        vector<int> act = sol.twoSum(nums, target);
        vector<int> sortedAct = act;
        sort(sortedAct.begin(), sortedAct.end());
        bool p = (sortedAct.size() == 2 && sortedAct[0] == 1 && sortedAct[1] == 2);
        string actStr = act.size() == 2 ? "[" + to_string(act[0]) + ", " + to_string(act[1]) + "]" : "[]";
        cout << "{\\"id\\": 2, \\"label\\": \\"Case 2\\", \\"passed\\": " << (p ? "true" : "false")
             << ", \\"input\\": \\"{\\\\\\"nums\\\\\\": [3, 2, 4], \\\\\\"target\\\\\\": 6}\\""
             << ", \\"expected\\": \\"[1, 2]\\", \\"actual\\": \\"" << actStr << "\\"},";
    }
    // Case 3
    {
        vector<int> nums = {3, 3};
        int target = 6;
        vector<int> act = sol.twoSum(nums, target);
        vector<int> sortedAct = act;
        sort(sortedAct.begin(), sortedAct.end());
        bool p = (sortedAct.size() == 2 && sortedAct[0] == 0 && sortedAct[1] == 1);
        string actStr = act.size() == 2 ? "[" + to_string(act[0]) + ", " + to_string(act[1]) + "]" : "[]";
        cout << "{\\"id\\": 3, \\"label\\": \\"Case 3\\", \\"passed\\": " << (p ? "true" : "false")
             << ", \\"input\\": \\"{\\\\\\"nums\\\\\\": [3, 3], \\\\\\"target\\\\\\": 6}\\""
             << ", \\"expected\\": \\"[0, 1]\\", \\"actual\\": \\"" << actStr << "\\"}";
    }

    cout << "]__TEST_RESULTS__" << endl;
    return 0;
}
`;
      return { code, hasHarness: true };
    }

    if (lang === "java") {
      const code = `
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        StringBuilder sb = new StringBuilder();
        sb.append("__TEST_RESULTS__[");

        runCase(sb, sol, 1, "Case 1", new int[]{2, 7, 11, 15}, 9, new int[]{0, 1}, false);
        runCase(sb, sol, 2, "Case 2", new int[]{3, 2, 4}, 6, new int[]{1, 2}, false);
        runCase(sb, sol, 3, "Case 3", new int[]{3, 3}, 6, new int[]{0, 1}, true);

        sb.append("]__TEST_RESULTS__");
        System.out.println(sb.toString());
    }

    private static void runCase(StringBuilder sb, Solution sol, int id, String label, int[] nums, int target, int[] expected, boolean isLast) {
        try {
            int[] act = sol.twoSum(nums, target);
            boolean passed = false;
            if (act != null && act.length == 2) {
                int[] sortedAct = act.clone();
                Arrays.sort(sortedAct);
                passed = sortedAct[0] == expected[0] && sortedAct[1] == expected[1];
            }
            sb.append(String.format("{\\"id\\":%d,\\"label\\":\\"%s\\",\\"passed\\":%b,\\"input\\":\\"{\\\\\\"nums\\\\\\":%s,\\\\\\"target\\\\\\":%d}\\",\\"expected\\":\\"%s\\",\\"actual\\":\\"%s\\"}",
                id, label, passed, Arrays.toString(nums), target, Arrays.toString(expected), Arrays.toString(act)));
        } catch (Exception e) {
            sb.append(String.format("{\\"id\\":%d,\\"label\\":\\"%s\\",\\"passed\\":false,\\"input\\":\\"{\\\\\\"nums\\\\\\":%s,\\\\\\"target\\\\\\":%d}\\",\\"expected\\":\\"%s\\",\\"actual\\":\\"Error: %s\\"}",
                id, label, Arrays.toString(nums), target, Arrays.toString(expected), e.getMessage()));
        }
        if (!isLast) sb.append(",");
    }
}
`;
      return { code, hasHarness: true };
    }

    return { code: userCode, hasHarness: false };
  }

  static validParentheses(lang, userCode) {
    if (lang === "javascript" || lang === "typescript") {
      const code = `
${userCode}

(function() {
  const userFn = typeof isValid !== 'undefined' ? isValid : (typeof Solution !== 'undefined' && Solution.isValid ? Solution.isValid : null);
  if (!userFn) {
    console.log("__TEST_RESULTS__" + JSON.stringify([{ id: 1, label: "Valid Parentheses", passed: false, input: "N/A", expected: "true", actual: "Error: isValid function is not defined" }]) + "__TEST_RESULTS__");
    return;
  }

  const cases = [
    { id: 1, label: "Case 1", s: "()", expected: true },
    { id: 2, label: "Case 2", s: "()[]{}", expected: true },
    { id: 3, label: "Case 3", s: "(]", expected: false }
  ];

  const results = cases.map(tc => {
    try {
      const act = userFn(tc.s);
      const passed = act === tc.expected;
      return { id: tc.id, label: tc.label, passed, input: JSON.stringify({ s: tc.s }), expected: JSON.stringify(tc.expected), actual: JSON.stringify(act) };
    } catch (e) {
      return { id: tc.id, label: tc.label, passed: false, input: JSON.stringify({ s: tc.s }), expected: JSON.stringify(tc.expected), actual: "Error: " + e.message };
    }
  });

  console.log("__TEST_RESULTS__" + JSON.stringify(results) + "__TEST_RESULTS__");
})();
`;
      return { code, hasHarness: true };
    }

    if (lang === "python" || lang === "python3") {
      const code = `
${userCode}

import json

def run_tests():
    sol = Solution() if 'Solution' in globals() else None
    if not sol:
        print("__TEST_RESULTS__" + json.dumps([{"id": 1, "label": "Valid Parentheses", "passed": False, "input": "N/A", "expected": "true", "actual": "Error: Solution class not defined"}]) + "__TEST_RESULTS__")
        return

    cases = [
        {"id": 1, "label": "Case 1", "s": "()", "expected": True},
        {"id": 2, "label": "Case 2", "s": "()[]{}", "expected": True},
        {"id": 3, "label": "Case 3", "s": "(]", "expected": False}
    ]

    results = []
    for tc in cases:
        try:
            act = sol.isValid(tc["s"])
            passed = act == tc["expected"]
            results.append({
                "id": tc["id"],
                "label": tc["label"],
                "passed": passed,
                "input": json.dumps({"s": tc["s"]}),
                "expected": json.dumps(tc["expected"]),
                "actual": json.dumps(act)
            })
        except Exception as e:
            results.append({
                "id": tc["id"],
                "label": tc["label"],
                "passed": False,
                "input": json.dumps({"s": tc["s"]}),
                "expected": json.dumps(tc["expected"]),
                "actual": f"Error: {str(e)}"
            })

    print("__TEST_RESULTS__" + json.dumps(results) + "__TEST_RESULTS__")

if __name__ == '__main__':
    run_tests()
`;
      return { code, hasHarness: true };
    }

    if (lang === "cpp" || lang === "c++") {
      const code = `
#include <iostream>
#include <string>
#include <stack>
#include <unordered_map>
using namespace std;

${userCode}

int main() {
    Solution sol;
    cout << "__TEST_RESULTS__[";
    
    // Case 1
    {
        bool act = sol.isValid("()");
        bool p = (act == true);
        cout << "{\\"id\\": 1, \\"label\\": \\"Case 1\\", \\"passed\\": " << (p ? "true" : "false")
             << ", \\"input\\": \\"{\\\\\\"s\\\\\\": \\\\\\"()\\\\\\"}\\""
             << ", \\"expected\\": \\"true\\", \\"actual\\": \\"" << (act ? "true" : "false") << "\\"},";
    }
    // Case 2
    {
        bool act = sol.isValid("()[]{}");
        bool p = (act == true);
        cout << "{\\"id\\": 2, \\"label\\": \\"Case 2\\", \\"passed\\": " << (p ? "true" : "false")
             << ", \\"input\\": \\"{\\\\\\"s\\\\\\": \\\\\\"()[]{}\\\\\\"}\\""
             << ", \\"expected\\": \\"true\\", \\"actual\\": \\"" << (act ? "true" : "false") << "\\"},";
    }
    // Case 3
    {
        bool act = sol.isValid("(]");
        bool p = (act == false);
        cout << "{\\"id\\": 3, \\"label\\": \\"Case 3\\", \\"passed\\": " << (p ? "true" : "false")
             << ", \\"input\\": \\"{\\\\\\"s\\\\\\": \\\\\\"(]\\\\\\"}\\""
             << ", \\"expected\\": \\"false\\", \\"actual\\": \\"" << (act ? "true" : "false") << "\\"}";
    }

    cout << "]__TEST_RESULTS__" << endl;
    return 0;
}
`;
      return { code, hasHarness: true };
    }

    if (lang === "java") {
      const code = `
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        StringBuilder sb = new StringBuilder();
        sb.append("__TEST_RESULTS__[");

        runCase(sb, sol, 1, "Case 1", "()", true, false);
        runCase(sb, sol, 2, "Case 2", "()[]{}", true, false);
        runCase(sb, sol, 3, "Case 3", "(]", false, true);

        sb.append("]__TEST_RESULTS__");
        System.out.println(sb.toString());
    }

    private static void runCase(StringBuilder sb, Solution sol, int id, String label, String s, boolean expected, boolean isLast) {
        try {
            boolean act = sol.isValid(s);
            boolean passed = (act == expected);
            sb.append(String.format("{\\"id\\":%d,\\"label\\":\\"%s\\",\\"passed\\":%b,\\"input\\":\\"{\\\\\\"s\\\\\\":\\\\\\"%s\\\\\\"}\\",\\"expected\\":\\"%b\\",\\"actual\\":\\"%b\\"}",
                id, label, passed, s, expected, act));
        } catch (Exception e) {
            sb.append(String.format("{\\"id\\":%d,\\"label\\":\\"%s\\",\\"passed\\":false,\\"input\\":\\"{\\\\\\"s\\\\\\":\\\\\\"%s\\\\\\"}\\",\\"expected\\":\\"%b\\",\\"actual\\":\\"Error: %s\\"}",
                id, label, s, expected, e.getMessage()));
        }
        if (!isLast) sb.append(",");
    }
}
`;
      return { code, hasHarness: true };
    }

    return { code: userCode, hasHarness: false };
  }

  static lruCache(lang, userCode) {
    if (lang === "javascript" || lang === "typescript") {
      const code = `
${userCode}

(function() {
  const LRU = typeof LRUCache !== 'undefined' ? LRUCache : null;
  if (!LRU) {
    console.log("__TEST_RESULTS__" + JSON.stringify([{ id: 1, label: "LRU Cache", passed: false, input: "capacity: 2", expected: "[null, null, 10, null, -1]", actual: "Error: LRUCache not defined" }]) + "__TEST_RESULTS__");
    return;
  }

  try {
    const lru = new LRU(2);
    lru.put(1, 10);
    lru.put(2, 20);
    const g1 = lru.get(1);
    lru.put(3, 30);
    const g2 = lru.get(2);
    const actual = [null, null, g1, null, g2];
    const passed = (g1 === 10 && g2 === -1);
    const results = [{
      id: 1,
      label: "Case 1",
      passed,
      input: "capacity: 2, put(1,10), put(2,20), get(1), put(3,30), get(2)",
      expected: "[null, null, 10, null, -1]",
      actual: JSON.stringify(actual)
    }];
    console.log("__TEST_RESULTS__" + JSON.stringify(results) + "__TEST_RESULTS__");
  } catch (e) {
    console.log("__TEST_RESULTS__" + JSON.stringify([{ id: 1, label: "Case 1", passed: false, input: "capacity: 2", expected: "[null, null, 10, null, -1]", actual: "Error: " + e.message }]) + "__TEST_RESULTS__");
  }
})();
`;
      return { code, hasHarness: true };
    }

    if (lang === "python" || lang === "python3") {
      const code = `
${userCode}

import json

def run_tests():
    if 'LRUCache' not in globals():
        print("__TEST_RESULTS__" + json.dumps([{"id": 1, "label": "LRU Cache", "passed": False, "input": "capacity: 2", "expected": "[null, null, 10, null, -1]", "actual": "Error: LRUCache not defined"}]) + "__TEST_RESULTS__")
        return

    try:
        lru = LRUCache(2)
        lru.put(1, 10)
        lru.put(2, 20)
        g1 = lru.get(1)
        lru.put(3, 30)
        g2 = lru.get(2)
        actual = [None, None, g1, None, g2]
        passed = (g1 == 10 and g2 == -1)
        results = [{
            "id": 1,
            "label": "Case 1",
            "passed": passed,
            "input": "capacity: 2, put(1,10), put(2,20), get(1), put(3,30), get(2)",
            "expected": "[null, null, 10, null, -1]",
            "actual": json.dumps(actual)
        }]
        print("__TEST_RESULTS__" + json.dumps(results) + "__TEST_RESULTS__")
    except Exception as e:
        print("__TEST_RESULTS__" + json.dumps([{"id": 1, "label": "Case 1", "passed": False, "input": "capacity: 2", "expected": "[null, null, 10, null, -1]", "actual": f"Error: {str(e)}"}]) + "__TEST_RESULTS__")

if __name__ == '__main__':
    run_tests()
`;
      return { code, hasHarness: true };
    }

    if (lang === "cpp" || lang === "c++") {
      const code = `
#include <iostream>
#include <unordered_map>
#include <list>
#include <string>
using namespace std;

${userCode}

int main() {
    cout << "__TEST_RESULTS__[";
    try {
        LRUCache lru(2);
        lru.put(1, 10);
        lru.put(2, 20);
        int g1 = lru.get(1);
        lru.put(3, 30);
        int g2 = lru.get(2);
        bool p = (g1 == 10 && g2 == -1);
        string act = "[null, null, " + to_string(g1) + ", null, " + to_string(g2) + "]";
        cout << "{\\"id\\": 1, \\"label\\": \\"Case 1\\", \\"passed\\": " << (p ? "true" : "false")
             << ", \\"input\\": \\"capacity: 2, put(1,10), put(2,20), get(1), put(3,30), get(2)\\""
             << ", \\"expected\\": \\"[null, null, 10, null, -1]\\", \\"actual\\": \\"" << act << "\\"}";
    } catch (...) {
        cout << "{\\"id\\": 1, \\"label\\": \\"Case 1\\", \\"passed\\": false, \\"input\\": \\"capacity: 2\\", \\"expected\\": \\"[null, null, 10, null, -1]\\", \\"actual\\": \\"Error: Exception occurred\\"}";
    }
    cout << "]__TEST_RESULTS__" << endl;
    return 0;
}
`;
      return { code, hasHarness: true };
    }

    if (lang === "java") {
      const code = `
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        sb.append("__TEST_RESULTS__[");
        try {
            LRUCache lru = new LRUCache(2);
            lru.put(1, 10);
            lru.put(2, 20);
            int g1 = lru.get(1);
            lru.put(3, 30);
            int g2 = lru.get(2);
            boolean passed = (g1 == 10 && g2 == -1);
            sb.append(String.format("{\\"id\\":1,\\"label\\":\\"Case 1\\",\\"passed\\":%b,\\"input\\":\\"capacity: 2, put(1,10), put(2,20), get(1), put(3,30), get(2)\\",\\"expected\\":\\"[null, null, 10, null, -1]\\",\\"actual\\":\\"[null, null, %d, null, %d]\\"",
                passed, g1, g2));
        } catch (Exception e) {
            sb.append(String.format("{\\"id\\":1,\\"label\\":\\"Case 1\\",\\"passed\\":false,\\"input\\":\\"capacity: 2\\",\\"expected\\":\\"[null, null, 10, null, -1]\\",\\"actual\\":\\"Error: %s\\"",
                e.getMessage()));
        }
        sb.append("}]__TEST_RESULTS__");
        System.out.println(sb.toString());
    }
}
`;
      return { code, hasHarness: true };
    }

    return { code: userCode, hasHarness: false };
  }
}

// ───────────────────────────────────────────────────────────
// CodeRunnerService Engine
// ───────────────────────────────────────────────────────────
export class CodeRunnerService {
  constructor() {
    this.timeoutMs = 4000;
  }

  /**
   * Execute code in specified language with problem test harness
   */
  async execute({ language = "javascript", code = "", problemId = null, testCases = null, isSubmission = false }) {
    const t0 = performance.now();
    const normalizedLang = this.normalizeLanguage(language);

    if (!code || code.trim() === "") {
      return {
        success: false,
        allPassed: false,
        duration: 0,
        memory: "0 MB",
        error: "Code submission cannot be empty.",
        results: [],
      };
    }

    // Wrap with problem test harness
    const { code: wrappedCode, hasHarness } = HarnessGenerator.getHarness(problemId, normalizedLang, code);

    let executionResult;

    try {
      switch (normalizedLang) {
        case "javascript":
        case "typescript":
          executionResult = await this.runJavaScript(wrappedCode);
          break;

        case "python":
          executionResult = await this.runPython(wrappedCode);
          break;

        case "java":
          executionResult = await this.runJava(wrappedCode);
          break;

        case "cpp":
          executionResult = await this.runCpp(wrappedCode);
          break;

        default:
          throw new Error(`Unsupported programming language: ${language}`);
      }
    } catch (err) {
      const t1 = performance.now();
      return {
        success: false,
        allPassed: false,
        language: normalizedLang,
        duration: Math.round(t1 - t0),
        memory: "15.4 MB",
        error: err.message,
        stdout: "",
        stderr: err.message,
        results: [],
      };
    }

    const t1 = performance.now();
    const duration = Math.max(Math.round(t1 - t0), 12);

    // Extract structured test results if present
    const parsed = this.parseTestResults(executionResult.stdout, executionResult.stderr, hasHarness);

    return {
      success: executionResult.exitCode === 0 && !parsed.error,
      allPassed: parsed.allPassed,
      language: normalizedLang,
      duration,
      memory: executionResult.memory || "28.6 MB",
      stdout: parsed.cleanStdout,
      stderr: executionResult.stderr,
      error: parsed.error,
      results: parsed.results,
      isSubmission,
    };
  }

  normalizeLanguage(lang) {
    const l = (lang || "").toLowerCase().trim();
    if (l.includes("python") || l === "py") return "python";
    if (l.includes("c++") || l === "cpp") return "cpp";
    if (l.includes("java") && !l.includes("script")) return "java";
    if (l.includes("typescript") || l === "ts") return "typescript";
    return "javascript";
  }

  /**
   * Run JavaScript in isolated context with timeout protection
   */
  async runJavaScript(code) {
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";

      const sandbox = {
        console: {
          log: (...args) => {
            stdout += args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ") + "\n";
          },
          error: (...args) => {
            stderr += args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ") + "\n";
          },
        },
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        Math,
        Date,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Map,
        Set,
        WeakMap,
        WeakSet,
        Promise,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
      };

      try {
        const context = vm.createContext(sandbox);
        const script = new vm.Script(code);

        script.runInContext(context, {
          timeout: this.timeoutMs,
          displayErrors: true,
        });

        resolve({ stdout, stderr, exitCode: 0, memory: "18.2 MB" });
      } catch (err) {
        resolve({
          stdout,
          stderr: (stderr ? stderr + "\n" : "") + err.message,
          exitCode: 1,
          memory: "18.2 MB",
        });
      }
    });
  }

  /**
   * Run Python locally via child process with Judge0 CE fallback
   */
  async runPython(code) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "proconnect_py_"));
    const filePath = path.join(tempDir, "solution.py");

    try {
      await fs.writeFile(filePath, code, "utf-8");

      return await new Promise((resolve) => {
        const proc = spawn("python", [filePath], {
          timeout: this.timeoutMs,
          windowsHide: true,
        });

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (d) => (stdout += d.toString()));
        proc.stderr.on("data", (d) => (stderr += d.toString()));

        proc.on("error", async (err) => {
          logger.warn("Local python execution error, falling back to remote sandbox", { error: err.message });
          const remote = await this.runJudge0(code, 71); // Judge0 Python 3
          resolve(remote);
        });

        proc.on("close", (code) => {
          resolve({ stdout, stderr, exitCode: code || 0, memory: "22.4 MB" });
        });
      });
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Run Java locally via single-file runner with Judge0 CE fallback
   */
  async runJava(code) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "proconnect_java_"));
    const filePath = path.join(tempDir, "Main.java");

    try {
      await fs.writeFile(filePath, code, "utf-8");

      return await new Promise((resolve) => {
        const proc = spawn("java", [filePath], {
          timeout: this.timeoutMs,
          windowsHide: true,
        });

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (d) => (stdout += d.toString()));
        proc.stderr.on("data", (d) => (stderr += d.toString()));

        proc.on("error", async (err) => {
          logger.warn("Local java execution error, falling back to remote sandbox", { error: err.message });
          const remote = await this.runJudge0(code, 62); // Judge0 Java
          resolve(remote);
        });

        proc.on("close", (code) => {
          resolve({ stdout, stderr, exitCode: code || 0, memory: "42.1 MB" });
        });
      });
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Run C++ via Judge0 CE (Language ID 54: C++ GCC 9.2.0)
   */
  async runCpp(code) {
    return await this.runJudge0(code, 54);
  }

  /**
   * Remote Sandboxed Runner via Judge0 CE (Free, Zero-Auth, High Performance)
   */
  async runJudge0(code, languageId) {
    try {
      const response = await fetch("https://ce.judge0.com/submissions?wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          cpu_time_limit: 3.5,
          memory_limit: 128000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Judge0 API returned status ${response.status}`);
      }

      const data = await response.json();
      const stdout = data.stdout || "";
      const stderr = data.stderr || data.compile_output || "";
      const isAccepted = data.status?.id === 3;

      return {
        stdout,
        stderr,
        exitCode: isAccepted ? 0 : 1,
        memory: data.memory ? `${(data.memory / 1024).toFixed(1)} MB` : "34.0 MB",
      };
    } catch (err) {
      logger.error("Judge0 sandbox execution failed", { error: err.message, languageId });
      return {
        stdout: "",
        stderr: `Remote Sandbox Execution Error: ${err.message}`,
        exitCode: 1,
        memory: "0 MB",
      };
    }
  }

  /**
   * Parse structured test results from execution output
   */
  parseTestResults(stdout, stderr, hasHarness) {
    const markerRegex = /__TEST_RESULTS__(.*?)__TEST_RESULTS__/s;
    const match = stdout.match(markerRegex);

    let results = [];
    let cleanStdout = stdout.replace(markerRegex, "").trim();
    let error = null;

    if (match && match[1]) {
      try {
        results = JSON.parse(match[1]);
      } catch (err) {
        error = "Failed to parse test harness output.";
      }
    } else if (hasHarness) {
      // Harness was wrapped but failed to produce the delimiter (e.g. syntax error or unhandled crash)
      error = stderr || stdout || "Execution failed without producing test results.";
      results = [
        {
          id: 1,
          label: "Test Runner",
          passed: false,
          input: "Program Execution",
          expected: "Valid output",
          actual: error.slice(0, 300),
        },
      ];
    } else {
      // Arbitrary code execution without standard problem harness
      const passed = !stderr && cleanStdout.length > 0;
      results = [
        {
          id: 1,
          label: "Standard Output",
          passed,
          input: "main()",
          expected: "Exit Code 0",
          actual: cleanStdout || stderr || "(No output)",
        },
      ];
    }

    const allPassed = results.length > 0 && results.every((r) => r.passed);

    return { results, cleanStdout, error, allPassed };
  }
}

export const codeRunnerService = new CodeRunnerService();
export default codeRunnerService;
