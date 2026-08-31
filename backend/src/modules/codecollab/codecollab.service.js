import codeCollabRepository from "./codecollab.repository.js";
import { NotFoundError } from "../../core/errors/AppError.js";

const DEFAULT_STARTERS = {
  javascript: `// Two Sum Problem
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log("Output:", twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]`,
  python: `# LRU Cache Implementation
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
lru.put(1, 1)
lru.put(2, 2)
print("Get 1:", lru.get(1))`,
  go: `package main

import (
	"fmt"
	"sync"
)

// Concurrent Token Bucket Rate Limiter
func main() {
	var wg sync.WaitGroup
	tokens := make(chan struct{}, 5)
	
	for i := 0; i < 5; i++ {
		tokens <- struct{}{}
	}
	
	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			<-tokens
			fmt.Printf("Worker %d executed request\\n", id)
		}(i)
	}
	wg.Wait()
}`,
};

class CodeCollabService {
  async createSession(userId, { title, language, challengeName }) {
    const sessionId = "room-" + Math.random().toString(36).substring(2, 9);
    const selectedLang = language || "javascript";
    const code = DEFAULT_STARTERS[selectedLang] || DEFAULT_STARTERS.javascript;

    return await codeCollabRepository.createSession({
      sessionId,
      title: title || "Live Technical Pair Programming",
      language: selectedLang,
      code,
      creatorId: userId,
      participants: [userId],
      challengePreset: {
        name: challengeName || "Algorithmic Challenge",
      },
    });
  }

  async getSession(sessionId) {
    const session = await codeCollabRepository.findBySessionId(sessionId);
    if (!session) throw new NotFoundError("Session not found");
    return session;
  }

  async syncCode(sessionId, code, language) {
    return await codeCollabRepository.updateCode(sessionId, code, language);
  }

  async joinSession(sessionId, userId) {
    const session = await codeCollabRepository.findBySessionId(sessionId);
    if (!session) throw new NotFoundError("Session not found");
    return await codeCollabRepository.addParticipant(sessionId, userId);
  }
}

export default new CodeCollabService();
