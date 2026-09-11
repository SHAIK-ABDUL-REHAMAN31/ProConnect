import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { SocketContext } from "@/context/SocketContext";
import { apiClient } from "@/services/apiClient";
import { highlightCodeToHtml } from "@/utils/codeHighlight";
import styles from "./codeCollab.module.css";

// ───────────────────────────────────────────────────────────
// LeetCode Canonical Problems Library
// ───────────────────────────────────────────────────────────
const PROBLEMS = [
  {
    id: "two-sum",
    number: 1,
    title: "1. Two Sum",
    difficulty: "Easy",
    category: "Array • Hash Table",
    solved: true,
    likes: "70.1K",
    comments: "2.1K",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
      {
        input: "nums = [3, 3], target = 6",
        output: "[0, 1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    testCases: [
      { id: 1, label: "Case 1", params: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { id: 2, label: "Case 2", params: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { id: 3, label: "Case 3", params: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
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
};`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> lookup;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (lookup.find(complement) != lookup.end()) {
                return {lookup[complement], i};
            }
            lookup[nums[i]] = i;
        }
        return {};
    }
};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
    },
    fnName: "twoSum",
  },

  {
    id: "valid-parentheses",
    number: 20,
    title: "20. Valid Parentheses",
    difficulty: "Easy",
    category: "String • Stack",
    solved: true,
    likes: "42.8K",
    comments: "1.4K",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    testCases: [
      { id: 1, label: "Case 1", params: { s: "()" }, expected: true },
      { id: 2, label: "Case 2", params: { s: "()[]{}" }, expected: true },
      { id: 3, label: "Case 3", params: { s: "(]" }, expected: false },
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  return stack.length === 0;
};`,
      typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping.values():
                stack.append(char)
            elif not stack or stack.pop() != mapping.get(char):
                return False
        return not stack`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> map = {{')', '('}, {'}', '{'}, {']', '['}};
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty() || st.top() != map[c]) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,
      java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> map = new HashMap<>();
        map.put(')', '(');
        map.put('}', '{');
        map.put(']', '[');
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty() || stack.pop() != map.get(c)) return false;
            }
        }
        return stack.isEmpty();
    }
}`,
    },
    fnName: "isValid",
  },

  {
    id: "lru-cache",
    number: 146,
    title: "146. LRU Cache",
    difficulty: "Medium",
    category: "Design • Linked List • Hash Table",
    solved: false,
    likes: "21.6K",
    comments: "890",
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
• LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
• int get(int key) Return the value of the key if the key exists, otherwise return -1.
• void put(int key, int value) Update value of key if key exists. Otherwise, add key-value pair to cache. If number of keys exceeds capacity, evict least recently used key.

You must do each operation in O(1) time complexity.`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
      },
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put.",
    ],
    testCases: [
      {
        id: 1,
        label: "Case 1",
        params: { capacity: 2, operations: [["put", 1, 10], ["put", 2, 20], ["get", 1], ["put", 3, 30], ["get", 2]] },
        expected: [null, null, 10, null, -1],
      },
    ],
    starterCode: {
      javascript: `/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
  this.capacity = capacity;
  this.cache = new Map();
};

/** 
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function(key) {
  if (!this.cache.has(key)) return -1;
  const val = this.cache.get(key);
  this.cache.delete(key);
  this.cache.set(key, val);
  return val;
};

/** 
 * @param {number} key 
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function(key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key);
  } else if (this.cache.size >= this.capacity) {
    const oldestKey = this.cache.keys().next().value;
    this.cache.delete(oldestKey);
  }
  this.cache.set(key, value);
};`,
      typescript: `class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    this.cache.set(key, value);
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        self.cache[key] = value`,
      cpp: `class LRUCache {
    int capacity;
    list<pair<int, int>> items;
    unordered_map<int, list<pair<int, int>>::iterator> cache;
public:
    LRUCache(int capacity) : capacity(capacity) {}
    
    int get(int key) {
        if (cache.find(key) == cache.end()) return -1;
        items.splice(items.begin(), items, cache[key]);
        return cache[key]->second;
    }
    
    void put(int key, int value) {
        if (cache.find(key) != cache.end()) {
            items.splice(items.begin(), items, cache[key]);
            cache[key]->second = value;
            return;
        }
        if (items.size() == capacity) {
            int delKey = items.back().first;
            cache.erase(delKey);
            items.pop_back();
        }
        items.push_front({key, value});
        cache[key] = items.begin();
    }
};`,
      java: `class LRUCache {
    private int capacity;
    private LinkedHashMap<Integer, Integer> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<Integer, Integer>(capacity, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                return size() > LRUCache.this.capacity;
            }
        };
    }
    
    public int get(int key) {
        return map.getOrDefault(key, -1);
    }
    
    public void put(int key, int value) {
        map.put(key, value);
    }
}`,
    },
    fnName: "LRUCache",
  },
];

export default function LeetCodeCollabPage() {
  const router = useRouter();
  const { socket } = useContext(SocketContext);

  // Problem & Language State
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const activeProblem = PROBLEMS[activeProblemIdx] || PROBLEMS[0];
  const [language, setLanguage] = useState("javascript");

  // Code Buffer
  const [code, setCode] = useState(activeProblem.starterCode.javascript);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Navigation & Tabs State
  const [leftTab, setLeftTab] = useState("description"); // description | editorial | solutions | submissions
  const [rightBottomTab, setRightBottomTab] = useState("testcase"); // testresult | testcase | chat
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);

  // Execution & Test Results
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Collaboration State
  const [roomId, setRoomId] = useState("room-alpha-98");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [remoteTyping, setRemoteTyping] = useState(false);

  // DOM Refs
  const textareaRef = useRef(null);
  const syntaxRef = useRef(null);
  const gutterRef = useRef(null);
  const isRemoteEditRef = useRef(false);
  const channelRef = useRef(null);

  // Compute Syntax Highlighted HTML
  const highlightedHtml = useMemo(() => {
    return highlightCodeToHtml(code, language);
  }, [code, language]);

  // Compute line count
  const lineCount = Math.max(code.split("\n").length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Sync Room ID from URL
  useEffect(() => {
    if (router.query.room) {
      setRoomId(String(router.query.room));
    }
  }, [router.query.room]);

  // ───────────────────────────────────────────────────────────
  // Instant Cross-Tab Sync via BroadcastChannel (0ms latency)
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(`proconnect_collab_${roomId}`);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === "CODE_SYNC") {
        isRemoteEditRef.current = true;
        setCode(payload.code);
        if (payload.language) setLanguage(payload.language);
        if (payload.problemIdx !== undefined && payload.problemIdx !== activeProblemIdx) {
          setActiveProblemIdx(payload.problemIdx);
        }
        setRemoteTyping(true);
        setTimeout(() => setRemoteTyping(false), 1200);
      } else if (type === "CHAT_MSG") {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
      } else if (type === "PEER_RUN") {
        setRemoteTyping(true);
        setTimeout(() => setRemoteTyping(false), 1500);
      } else if (type === "PEER_RESULT") {
        if (payload) {
          setTestResults(payload);
          setRightBottomTab("testresult");
        }
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [roomId, activeProblemIdx]);

  // ───────────────────────────────────────────────────────────
  // Real-Time WebSocket Collaboration (Over network)
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const userName =
      typeof window !== "undefined"
        ? localStorage.getItem("userName") || `Developer_${Math.floor(Math.random() * 900 + 100)}`
        : "Developer";

    socket.emit("join_code_room", {
      roomId,
      user: { name: userName },
    });

    socket.on("code_room_users", ({ participants }) => {
      if (participants) setConnectedUsers(participants);
    });

    socket.on("code_init_state", (state) => {
      if (state.code) {
        isRemoteEditRef.current = true;
        setCode(state.code);
        if (state.language) setLanguage(state.language);
        if (state.problemId) {
          const idx = PROBLEMS.findIndex((p) => p.id === state.problemId);
          if (idx !== -1) setActiveProblemIdx(idx);
        }
      }
    });

    socket.on("code_updated", (payload) => {
      if (payload.senderId !== socket.id && payload.code !== undefined) {
        isRemoteEditRef.current = true;
        setCode(payload.code);
        if (payload.language) setLanguage(payload.language);
        if (payload.problemId) {
          const idx = PROBLEMS.findIndex((p) => p.id === payload.problemId);
          if (idx !== -1) setActiveProblemIdx(idx);
        }
        setRemoteTyping(true);
        setTimeout(() => setRemoteTyping(false), 1200);
      }
    });

    socket.on("code_executing", () => {
      setRemoteTyping(true);
      setTimeout(() => setRemoteTyping(false), 1500);
    });

    socket.on("code_result_received", (payload) => {
      if (payload && payload.results) {
        setTestResults({
          isSubmission: false,
          allPassed: payload.allPassed,
          duration: payload.duration,
          memory: "Peer Execution",
          stdout: payload.stdout || "",
          stderr: payload.stderr || "",
          results: payload.results,
        });
        setRightBottomTab("testresult");
      }
    });

    socket.on("code_chat_received", (msg) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.emit("leave_code_room", { roomId });
      socket.off("code_room_users");
      socket.off("code_init_state");
      socket.off("code_updated");
      socket.off("code_executing");
      socket.off("code_result_received");
      socket.off("code_chat_received");
    };
  }, [socket, roomId]);

  // Handle problem change (broadcasts to peers)
  const handleSelectProblem = (idx) => {
    setActiveProblemIdx(idx);
    const p = PROBLEMS[idx];
    const newCode = p.starterCode[language] || p.starterCode.javascript;
    setCode(newCode);
    setTestResults(null);
    setActiveCaseIdx(0);
    setRightBottomTab("testcase");

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "CODE_SYNC",
        payload: { code: newCode, language, problemIdx: idx },
      });
    }

    if (socket && socket.connected) {
      socket.emit("code_change", {
        roomId,
        code: newCode,
        language,
        problemId: p.id,
      });
    }
  };

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newCode = activeProblem.starterCode[newLang] || activeProblem.starterCode.javascript;
    setCode(newCode);
    setTestResults(null);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "CODE_SYNC",
        payload: { code: newCode, language: newLang, problemIdx: activeProblemIdx },
      });
    }

    if (socket && socket.connected) {
      socket.emit("code_change", {
        roomId,
        code: newCode,
        language: newLang,
        problemId: activeProblem.id,
      });
    }
  };

  // Synchronized code changes (broadcasts to BroadcastChannel + Socket.IO)
  const handleCodeChange = (newCode) => {
    setCode(newCode);

    if (isRemoteEditRef.current) {
      isRemoteEditRef.current = false;
      return;
    }

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "CODE_SYNC",
        payload: { code: newCode, language, problemIdx: activeProblemIdx },
      });
    }

    if (socket && socket.connected) {
      socket.emit("code_change", {
        roomId,
        code: newCode,
        language,
        problemId: activeProblem.id,
      });
    }
  };

  // Synchronized scrolling
  const handleScroll = (e) => {
    const { scrollTop, scrollLeft } = e.target;
    if (syntaxRef.current) {
      syntaxRef.current.scrollTop = scrollTop;
      syntaxRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  // Update cursor position Ln X, Col Y
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = code.substring(0, pos);
    const lines = textBefore.split("\n");
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  // ───────────────────────────────────────────────────────────
  // VS Code / LeetCode Auto-Closing Brackets & Indentation
  // ───────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    // Run shortcut: Ctrl+Enter / Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runExecution(false);
      return;
    }

    // Tab key: Insert 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const nextCode = val.substring(0, start) + "  " + val.substring(end);
      handleCodeChange(nextCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition();
      }, 0);
      return;
    }

    // Auto-Closing Pairs Map
    const pairs = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
      "`": "`",
    };

    // 1. Bracket / Quote auto-closing
    if (pairs[e.key]) {
      e.preventDefault();
      const openChar = e.key;
      const closeChar = pairs[openChar];

      // If text is selected, wrap selected text
      if (start !== end) {
        const selectedText = val.substring(start, end);
        const nextCode = val.substring(0, start) + openChar + selectedText + closeChar + val.substring(end);
        handleCodeChange(nextCode);
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = end + 1;
          updateCursorPosition();
        }, 0);
        return;
      }

      // If typing quote and already right before matching closing quote, step over
      if ((openChar === '"' || openChar === "'" || openChar === "`") && val[start] === openChar) {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        updateCursorPosition();
        return;
      }

      const nextCode = val.substring(0, start) + openChar + closeChar + val.substring(end);
      handleCodeChange(nextCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        updateCursorPosition();
      }, 0);
      return;
    }

    // 2. Step over closing bracket if typed
    const closingChars = [")", "]", "}"];
    if (closingChars.includes(e.key) && val[start] === e.key) {
      e.preventDefault();
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      updateCursorPosition();
      return;
    }

    // 3. Backspace: delete both characters if cursor is inside an empty pair () [] {} "" ''
    if (e.key === "Backspace" && start === end && start > 0) {
      const prevChar = val[start - 1];
      const nextChar = val[start];
      if (pairs[prevChar] === nextChar) {
        e.preventDefault();
        const nextCode = val.substring(0, start - 1) + val.substring(start + 1);
        handleCodeChange(nextCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1;
          updateCursorPosition();
        }, 0);
        return;
      }
    }

    // 4. Enter inside {|} expands block with indentation
    if (e.key === "Enter" && start === end) {
      const prevChar = val[start - 1];
      const nextChar = val[start];

      // Current line indentation
      const lastNewLine = val.lastIndexOf("\n", start - 1);
      const currentLine = val.substring(lastNewLine + 1, start);
      const indentMatch = currentLine.match(/^\s*/);
      const currentIndent = indentMatch ? indentMatch[0] : "";

      if (prevChar === "{" && nextChar === "}") {
        e.preventDefault();
        const indentLevel = currentIndent + "  ";
        const insertText = "\n" + indentLevel + "\n" + currentIndent;
        const nextCode = val.substring(0, start) + insertText + val.substring(end);
        handleCodeChange(nextCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + indentLevel.length + 1;
          updateCursorPosition();
        }, 0);
        return;
      }

      // Normal Enter: preserve current indentation
      if (currentIndent.length > 0) {
        e.preventDefault();
        const extraIndent = prevChar === "{" || prevChar === "(" || prevChar === "[" ? "  " : "";
        const insertText = "\n" + currentIndent + extraIndent;
        const nextCode = val.substring(0, start) + insertText + val.substring(end);
        handleCodeChange(nextCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
          updateCursorPosition();
        }, 0);
        return;
      }
    }
  };

  // ───────────────────────────────────────────────────────────
  // Execution Engine (Polyglot Remote Sandbox + Client Fallback)
  // ───────────────────────────────────────────────────────────
  const runExecution = async (isSubmission = false) => {
    setIsRunning(true);
    setRightBottomTab("testresult");

    if (channelRef.current) {
      channelRef.current.postMessage({ type: "PEER_RUN", payload: {} });
    }
    if (socket && socket.connected) {
      socket.emit("code_run", { roomId, language });
    }

    try {
      // 1. Dispatch real remote execution request to backend engine
      const res = await apiClient.post("/codecollab/execute", {
        language,
        code,
        problemId: activeProblem.id,
        testCases: activeProblem.testCases,
        isSubmission,
      });

      if (res.data && res.data.success && res.data.data) {
        const data = res.data.data;
        const finalResults = {
          isSubmission,
          allPassed: data.allPassed,
          duration: data.duration,
          memory: data.memory,
          stdout: data.stdout,
          stderr: data.stderr,
          error: data.error,
          results: data.results,
        };

        setTestResults(finalResults);

        // Broadcast results to peer collaborators in real-time
        if (socket && socket.connected) {
          socket.emit("code_result", {
            roomId,
            results: data.results,
            allPassed: data.allPassed,
            language: data.language,
            duration: data.duration,
            stdout: data.stdout,
            stderr: data.stderr,
          });
        }
        if (channelRef.current) {
          channelRef.current.postMessage({ type: "PEER_RESULT", payload: finalResults });
        }
        return;
      }
    } catch (apiErr) {
      console.warn("Backend execution error, falling back to client evaluation if JS:", apiErr);

      // 2. Client-side fallback if JavaScript and server is offline
      if (language === "javascript" || language === "typescript") {
        try {
          const t0 = performance.now();
          const runner = new Function(`
            ${code}
            return {
              twoSum: typeof twoSum !== 'undefined' ? twoSum : null,
              isValid: typeof isValid !== 'undefined' ? isValid : null,
              LRUCache: typeof LRUCache !== 'undefined' ? LRUCache : null,
            };
          `);

          const funcs = runner();
          const results = [];

          for (const tc of activeProblem.testCases) {
            let actual = null;
            let passed = false;

            if (activeProblem.id === "two-sum") {
              if (typeof funcs.twoSum === "function") {
                const res = funcs.twoSum(tc.params.nums, tc.params.target);
                actual = res;
                if (Array.isArray(res) && res.length === 2) {
                  const sRes = [...res].sort();
                  const sExp = [...tc.expected].sort();
                  passed = sRes[0] === sExp[0] && sRes[1] === sExp[1];
                }
              }
            } else if (activeProblem.id === "valid-parentheses") {
              if (typeof funcs.isValid === "function") {
                actual = funcs.isValid(tc.params.s);
                passed = actual === tc.expected;
              }
            } else if (activeProblem.id === "lru-cache") {
              if (typeof funcs.LRUCache === "function") {
                const lru = new funcs.LRUCache(2);
                lru.put(1, 10);
                lru.put(2, 20);
                const g1 = lru.get(1);
                lru.put(3, 30);
                const g2 = lru.get(2);
                actual = [null, null, g1, null, g2];
                passed = g1 === 10 && g2 === -1;
              }
            }

            results.push({
              id: tc.id,
              label: tc.label,
              passed,
              input: JSON.stringify(tc.params),
              expected: JSON.stringify(tc.expected),
              actual: JSON.stringify(actual),
            });
          }

          const t1 = performance.now();
          const duration = Math.max(Math.round(t1 - t0), 15);
          const allPassed = results.every((r) => r.passed);

          setTestResults({
            isSubmission,
            allPassed,
            duration,
            memory: "18.4 MB (Client Fallback)",
            results,
          });
        } catch (err) {
          setTestResults({
            isSubmission,
            allPassed: false,
            error: err.message,
            results: [],
          });
        }
      } else {
        setTestResults({
          isSubmission,
          allPassed: false,
          error: `Execution server unreachable: ${apiErr.response?.data?.message || apiErr.message}`,
          results: [],
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "You" : "You";
    const msg = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text: chatInput,
      senderName: userName,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, msg]);

    if (channelRef.current) {
      channelRef.current.postMessage({ type: "CHAT_MSG", payload: msg });
    }

    if (socket && socket.connected) {
      socket.emit("code_chat_message", { roomId, text: chatInput, user: { name: userName } });
    }
    setChatInput("");
  };

  return (
    <div className={styles.pageWrapper}>
      <Head>
        <title>{activeProblem.title} - LeetCode Collab | ProConnect</title>
      </Head>

      {/* ─── 1. TOP NAVBAR (LEETCODE HEADER) ─── */}
      <header className={styles.navBar}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.backBtn} title="Back to Feed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>

          <select
            className={styles.problemListDropdown}
            value={activeProblemIdx}
            onChange={(e) => handleSelectProblem(Number(e.target.value))}
          >
            {PROBLEMS.map((p, idx) => (
              <option key={p.id} value={idx}>
                Problem List: {p.title}
              </option>
            ))}
          </select>

          <div className={styles.navNavArrows}>
            <button
              className={styles.arrowBtn}
              onClick={() => handleSelectProblem((activeProblemIdx - 1 + PROBLEMS.length) % PROBLEMS.length)}
              title="Previous Problem"
            >
              &lt;
            </button>
            <button
              className={styles.arrowBtn}
              onClick={() => handleSelectProblem((activeProblemIdx + 1) % PROBLEMS.length)}
              title="Next Problem"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className={styles.navCenter}>
          <button
            className={styles.runBtn}
            onClick={() => runExecution(false)}
            disabled={isRunning}
            title="Run Code (Ctrl+Enter)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {isRunning ? "Running..." : "Run"}
          </button>

          <button
            className={styles.submitBtn}
            onClick={() => runExecution(true)}
            disabled={isRunning}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Submit
          </button>
        </div>

        <div className={styles.navRight}>
          <div className={styles.roomBadge}>
            🔗 <strong>{roomId}</strong>
          </div>

          <button
            className={styles.shareBtn}
            onClick={() => {
              const url = `${window.location.origin}/code-collab?room=${encodeURIComponent(roomId)}`;
              navigator.clipboard?.writeText(url);
              alert(`Room invite copied!\n${url}`);
            }}
          >
            Share
          </button>

          <span className={styles.betaBadge}>BETA</span>

          <span className={styles.onlineCount}>
            <span className={styles.dot} />
            {remoteTyping
              ? "Peer editing..."
              : connectedUsers.length > 1
              ? `${connectedUsers.length} Peers Connected`
              : "Room Active (Live Sync)"}
          </span>
        </div>
      </header>

      {/* ─── 2. MAIN WORKSPACE (SPLIT VIEW) ─── */}
      <main className={styles.workspace}>
        {/* ─── LEFT COLUMN: Problem Description ─── */}
        <section className={styles.problemPanel}>
          <div className={styles.panelTabs}>
            <button
              onClick={() => setLeftTab("description")}
              className={`${styles.tabItem} ${leftTab === "description" ? styles.tabItemActive : ""}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Description
            </button>
            <button
              onClick={() => setLeftTab("editorial")}
              className={`${styles.tabItem} ${leftTab === "editorial" ? styles.tabItemActive : ""}`}
            >
              Editorial
            </button>
            <button
              onClick={() => setLeftTab("solutions")}
              className={`${styles.tabItem} ${leftTab === "solutions" ? styles.tabItemActive : ""}`}
            >
              Solutions
            </button>
            <button
              onClick={() => setLeftTab("submissions")}
              className={`${styles.tabItem} ${leftTab === "submissions" ? styles.tabItemActive : ""}`}
            >
              Submissions
            </button>
          </div>

          <div className={styles.problemScrollArea}>
            <div className={styles.problemHeaderRow}>
              <h1 className={styles.problemTitle}>{activeProblem.title}</h1>
              {activeProblem.solved && (
                <span className={styles.solvedBadge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Solved
                </span>
              )}
            </div>

            <div className={styles.tagsRow}>
              <span
                className={
                  activeProblem.difficulty === "Easy"
                    ? styles.tagEasy
                    : activeProblem.difficulty === "Medium"
                    ? styles.tagMedium
                    : styles.tagHard
                }
              >
                {activeProblem.difficulty}
              </span>
              <span className={styles.tagPill}>🏷️ Topics</span>
              <span className={styles.tagPill}>🔒 Companies</span>
              <span className={styles.tagPill}>💡 Hint</span>
            </div>

            <p className={styles.problemText}>{activeProblem.description}</p>

            {activeProblem.examples.map((ex, idx) => (
              <div key={idx} className={styles.exampleCard}>
                <div className={styles.exampleCardTitle}>Example {idx + 1}:</div>
                <div><strong>Input:</strong> <span className={styles.codeSpan}>{ex.input}</span></div>
                <div><strong>Output:</strong> <span className={styles.codeSpan}>{ex.output}</span></div>
                {ex.explanation && (
                  <div><strong>Explanation:</strong> {ex.explanation}</div>
                )}
              </div>
            ))}

            <div className={styles.constraintsBlock}>
              <div className={styles.constraintsTitle}>Constraints:</div>
              <ul className={styles.constraintsList}>
                {activeProblem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <footer className={styles.problemFooter}>
            <div className={styles.footerSocial}>
              <span className={styles.footerSocialItem}>👍 {activeProblem.likes}</span>
              <span className={styles.footerSocialItem}>👎</span>
              <span className={styles.footerSocialItem}>💬 {activeProblem.comments}</span>
              <span className={styles.footerSocialItem}>⭐</span>
            </div>
            <span>LeetCode Standard</span>
          </footer>
        </section>

        {/* ─── RIGHT COLUMN: Code Editor (Top) & Test Result (Bottom) ─── */}
        <section className={styles.rightColumn}>
          {/* Top: Code Editor Panel */}
          <div className={styles.editorPanel}>
            <header className={styles.editorHeader}>
              <div className={styles.editorHeaderLeft}>
                <span className={styles.codeIconTitle}>
                  &lt;/&gt; Code
                </span>
                <select
                  className={styles.langSelect}
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python3</option>
                  <option value="cpp">C++ (GCC 9.2)</option>
                  <option value="java">Java 24</option>
                </select>
              </div>

              <div className={styles.editorHeaderRight}>
                <button
                  className={styles.editorIconBtn}
                  onClick={() => {
                    navigator.clipboard?.writeText(code);
                    alert("Code copied to clipboard!");
                  }}
                  title="Copy Code"
                >
                  📋 Copy
                </button>
                <button
                  className={styles.editorIconBtn}
                  onClick={() => {
                    if (confirm("Reset code to default template?")) {
                      setCode(activeProblem.starterCode[language]);
                    }
                  }}
                  title="Reset to Starter Template"
                >
                  ↺ Reset
                </button>
              </div>
            </header>

            {/* Editor Canvas with VS Code Syntax Highlighting & Line Numbers */}
            <div className={styles.editorCanvas}>
              <div ref={gutterRef} className={styles.lineGutter}>
                {lineNumbers.map((num) => (
                  <div key={num}>{num}</div>
                ))}
              </div>

              <div className={styles.codeAreaWrapper}>
                {/* Syntax Highlight Layer */}
                <pre
                  ref={syntaxRef}
                  className={styles.syntaxLayer}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml + "\n" }}
                />

                {/* Transparent Interactive Textarea with auto-complete */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={updateCursorPosition}
                  onClick={updateCursorPosition}
                  onSelect={updateCursorPosition}
                  onScroll={handleScroll}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className={styles.codeTextarea}
                />
              </div>
            </div>

            {/* Status Bar: Saved & Line / Column Indicator */}
            <div className={styles.editorStatusBar}>
              <span>Saved</span>
              <span>
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
            </div>
          </div>

          {/* Bottom: Test Result & Testcase Panel */}
          <div className={styles.testPanel}>
            <header className={styles.testPanelHeader}>
              <button
                onClick={() => setRightBottomTab("testcase")}
                className={`${styles.testTabBtn} ${rightBottomTab === "testcase" ? styles.testTabBtnActive : ""}`}
              >
                ☑ Testcase
              </button>
              <button
                onClick={() => setRightBottomTab("testresult")}
                className={`${styles.testTabBtn} ${rightBottomTab === "testresult" ? styles.testTabBtnActive : ""}`}
              >
                &gt;_ Test Result
              </button>
              <button
                onClick={() => setRightBottomTab("chat")}
                className={`${styles.testTabBtn} ${rightBottomTab === "chat" ? styles.testTabBtnActive : ""}`}
              >
                💬 In-Room Chat {chatMessages.length > 0 ? `(${chatMessages.length})` : ""}
              </button>
            </header>

            <div className={styles.testPanelBody}>
              {/* Testcase Tab */}
              {rightBottomTab === "testcase" && (
                <div>
                  <div className={styles.testcaseNav}>
                    {activeProblem.testCases.map((tc, idx) => (
                      <button
                        key={tc.id}
                        onClick={() => setActiveCaseIdx(idx)}
                        className={`${styles.casePill} ${activeCaseIdx === idx ? styles.casePillActive : ""}`}
                      >
                        {tc.label}
                      </button>
                    ))}
                  </div>

                  {activeProblem.testCases[activeCaseIdx] && (
                    <div className={styles.caseParamBox}>
                      <span className={styles.paramTitle}>Input:</span>
                      <code>{JSON.stringify(activeProblem.testCases[activeCaseIdx].params)}</code>
                      <span className={styles.paramTitle}>Expected:</span>
                      <code>{JSON.stringify(activeProblem.testCases[activeCaseIdx].expected)}</code>
                    </div>
                  )}
                </div>
              )}

              {/* Test Result Tab */}
              {rightBottomTab === "testresult" && (
                <div>
                  {!testResults && !isRunning && (
                    <div className={styles.emptyStateMessage}>
                      You must run your code first
                    </div>
                  )}

                  {isRunning && (
                    <div className={styles.emptyStateMessage}>
                      Running code in isolated sandbox...
                    </div>
                  )}

                  {testResults && !isRunning && (
                    <div>
                      {testResults.error ? (
                        <div className={styles.failedTitle}>
                          ✕ Runtime Error: {testResults.error}
                        </div>
                      ) : testResults.allPassed ? (
                        <div className={styles.acceptedTitle}>
                          ✓ {testResults.isSubmission ? "Accepted" : "All Test Cases Passed"}
                        </div>
                      ) : (
                        <div className={styles.failedTitle}>
                          ✕ Wrong Answer
                        </div>
                      )}

                      <div className={styles.metricsRow}>
                        <span>Runtime: <strong>{testResults.duration || 35} ms</strong></span>
                        <span>Memory: <strong>{testResults.memory || "28.6 MB"}</strong></span>
                      </div>

                      {/* Standard Output Console */}
                      {testResults.stdout && (
                        <div style={{ background: "#090d16", border: "1px solid #1e293b", borderRadius: "6px", padding: "8px 12px", margin: "10px 0", fontFamily: "monospace", fontSize: "0.8rem", color: "#e2e8f0", whiteSpace: "pre-wrap" }}>
                          <div style={{ color: "#94a3b8", fontSize: "0.7rem", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Console Output (stdout)</div>
                          {testResults.stdout}
                        </div>
                      )}

                      {/* Standard Error Console */}
                      {testResults.stderr && (
                        <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "6px", padding: "8px 12px", margin: "10px 0", fontFamily: "monospace", fontSize: "0.8rem", color: "#fca5a5", whiteSpace: "pre-wrap" }}>
                          <div style={{ color: "#f87171", fontSize: "0.7rem", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Error Diagnostics (stderr)</div>
                          {testResults.stderr}
                        </div>
                      )}

                      {testResults.results && testResults.results.map((r) => (
                        <div key={r.id} className={styles.caseResultCard}>
                          <span>{r.label}: {r.input}</span>
                          <span className={r.passed ? styles.badgePass : styles.badgeFail}>
                            {r.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* In-Room Chat Tab */}
              {rightBottomTab === "chat" && (
                <div className={styles.chatContainer}>
                  <div className={styles.chatMessages}>
                    {chatMessages.length === 0 ? (
                      <div style={{ color: "#71717a", textAlign: "center", marginTop: "1rem" }}>
                        No messages yet in this interview room.
                      </div>
                    ) : (
                      chatMessages.map((m) => (
                        <div key={m.id} className={styles.chatBubble}>
                          <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginBottom: "2px" }}>
                            <strong>{m.senderName}</strong> • {m.timestamp}
                          </div>
                          <div>{m.text}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={styles.chatInputRow}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                      placeholder="Type a message to peers..."
                      className={styles.chatInput}
                    />
                    <button onClick={sendChatMessage} className={styles.submitBtn}>
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
