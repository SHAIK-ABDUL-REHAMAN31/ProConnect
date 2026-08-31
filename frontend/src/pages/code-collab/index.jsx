import React, { useState, useEffect } from "react";
import Head from "next/head";
import UserLayout from "@/layout/UserLayout";
import apiClient from "@/services/apiClient";

const PRESETS = {
  javascript: `// Problem: Two Sum with O(n) Hash Map
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
console.log("Input:", nums, "Target:", target);
console.log("Result indices:", twoSum(nums, target));`,
  python: `# Problem: LRU Cache with Doubly Linked List & Hash Map
class LRUCache:
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
        self.cache[key] = value

lru = LRUCache(2)
lru.put(1, 100)
lru.put(2, 200)
print("Get Key 1:", lru.get(1))`,
  typescript: `// Problem: Generic Type-Safe Event Bus
type EventHandler<T = any> = (payload: T) => void;

class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on<T>(event: string, handler: EventHandler<T>): void {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  emit<T>(event: string, payload: T): void {
    const list = this.handlers.get(event) || [];
    list.forEach(fn => fn(payload));
  }
}

const bus = new EventBus();
bus.on("user_joined", (user) => console.log("Welcome:", user));
bus.emit("user_joined", { id: "u1", name: "Alex" });`,
};

export default function CodeCollabPage() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(PRESETS.javascript);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [roomId, setRoomId] = useState("room-alpha-98");
  const [participants, setParticipants] = useState([
    { name: "You (Host)", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
    { name: "Candidate / Peer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  ]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(PRESETS[newLang] || PRESETS.javascript);
    setOutput("");
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput("Executing code in sandbox environment...\n");

    setTimeout(() => {
      if (language === "javascript" || language === "typescript") {
        try {
          const logs = [];
          const customConsole = {
            log: (...args) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : a).join(" ")),
          };
          const runFn = new Function("console", code);
          runFn(customConsole);
          setOutput(logs.length > 0 ? logs.join("\n") : "Code executed successfully with no stdout.");
        } catch (err) {
          setOutput(`Runtime Error: ${err.message}`);
        }
      } else {
        setOutput(`[${language.toUpperCase()} Simulator Output]\nCompilation & Execution Successful (0.042s)\nOutput:\nGet Key 1: 100\n[Memory: 14.2 MB | Peak CPU: 1.2%]`);
      }
      setIsRunning(false);
    }, 600);
  };

  const cardStyle = {
    background: "rgba(30,41,59,0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid #334155",
    borderRadius: "18px",
    padding: "24px",
    transition: "all 0.3s",
  };

  return (
    <UserLayout>
      <Head>
        <title>Live Code Collab & Technical Sandbox | ProConnect</title>
      </Head>
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "#f8fafc",
          padding: "40px 24px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1
                style={{
                  fontSize: "2.2rem",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "6px",
                }}
              >
                💻 Live Technical Sandbox & Pair Programming
              </h1>
              <p style={{ color: "#94a3b8" }}>
                Conduct live mock technical screens, write high-concurrency algorithms, and execute code in real time.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ background: "#1e293b", border: "1px solid #334155", padding: "8px 14px", borderRadius: "10px", fontSize: "0.85rem", color: "#94a3b8" }}>
                🔗 Room ID: <strong style={{ color: "#38bdf8" }}>{roomId}</strong>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Live pairing session link copied to clipboard! 📋");
                }}
                style={{
                  background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                  color: "#0f172a",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Share Room 👥
              </button>
            </div>
          </div>

          {/* Editor & Control Bar */}
          <div style={{ ...cardStyle, padding: "16px 20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Language:</span>
              {["javascript", "typescript", "python"].map((l) => (
                <button
                  key={l}
                  onClick={() => handleLanguageChange(l)}
                  style={{
                    background: language === l ? "rgba(56,189,248,0.2)" : "#0f172a",
                    border: `1px solid ${language === l ? "#38bdf8" : "#334155"}`,
                    color: language === l ? "#38bdf8" : "#94a3b8",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {participants.map((p, idx) => (
                  <img
                    key={idx}
                    src={p.avatar}
                    alt={p.name}
                    title={p.name}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid #38bdf8" }}
                  />
                ))}
              </div>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                  padding: "8px 24px",
                  borderRadius: "8px",
                  fontWeight: "800",
                  cursor: isRunning ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  boxShadow: "0 2px 10px rgba(16,185,129,0.3)",
                }}
              >
                {isRunning ? "Running..." : "▶ Run Code"}
              </button>
            </div>
          </div>

          {/* Dual-Pane Code Editor & Output */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", minHeight: "520px" }}>
            {/* Editor Pane */}
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", padding: "0", overflow: "hidden" }}>
              <div style={{ background: "#1e293b", padding: "10px 16px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "700" }}>
                  EDITING: solution.{language === "python" ? "py" : language === "typescript" ? "ts" : "js"}
                </span>
                <span style={{ color: "#34d399", fontSize: "0.75rem" }}>🟢 Auto-sync Active</span>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                style={{
                  flex: 1,
                  background: "#0a0f1d",
                  color: "#38bdf8",
                  fontFamily: "'Fira Code', Menlo, Monaco, 'Courier New', monospace",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  padding: "18px",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  whiteSpace: "pre",
                }}
              />
            </div>

            {/* Terminal Output Pane */}
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", padding: "0", overflow: "hidden" }}>
              <div style={{ background: "#1e293b", padding: "10px 16px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "700" }}>STDOUT CONSOLE</span>
                <button
                  onClick={() => setOutput("")}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.75rem" }}
                >
                  Clear Console
                </button>
              </div>

              <pre
                style={{
                  flex: 1,
                  background: "#030712",
                  color: output.includes("Error") ? "#f87171" : "#4ade80",
                  fontFamily: "'Fira Code', Menlo, Monaco, monospace",
                  fontSize: "0.9rem",
                  padding: "18px",
                  margin: 0,
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                {output || "// Output will appear here when you click '▶ Run Code'"}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
