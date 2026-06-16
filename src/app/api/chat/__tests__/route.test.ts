/**
 * Security gate + model router tests for POST /api/chat.
 *
 * Test A: tokenless call → 401
 * Test B: rate limit exceeded → 429
 * Test C: Cerebras fails → Groq fallback → 200
 * Test D: all providers exhausted → degraded mode → 200
 */

import { NextRequest } from "next/server";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// ── Shared test constants ──────────────────────────────────────────────────

const TEST_SECRET = "test-secret-that-is-long-enough-32c";

// ── next/headers mock (cookies()) ─────────────────────────────────────────

let mockCookieValue: string | undefined;

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) =>
        name === "chat_token" && mockCookieValue !== undefined
          ? { value: mockCookieValue }
          : undefined,
    }),
}));

// ── Upstash mocks (default: both limits pass) ──────────────────────────────

let burstSuccess = true;
let dailySuccess = true;

vi.mock("@upstash/redis", () => ({
  Redis: class {
    get() {
      return Promise.resolve(null);
    }
    set() {
      return Promise.resolve("OK");
    }
    incr() {
      return Promise.resolve(1);
    }
    expire() {
      return Promise.resolve(1);
    }
    exists() {
      return Promise.resolve(0);
    }
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() {
      return {};
    }
    limit(_key: string) {
      return Promise.resolve({
        success: burstSuccess && dailySuccess,
        remaining: burstSuccess && dailySuccess ? 9 : 0,
        reset: Date.now() + 60_000,
        limit: 10,
      });
    }
  },
}));

// ── Model router mock ──────────────────────────────────────────────────────

let routerMode: "live" | "degraded" | "cooldown" = "live";
let routerProvider: "cerebras" | "groq" | "mistral" = "cerebras";

vi.mock("@/lib/model-router", () => ({
  routeChat: () => {
    if (routerMode === "degraded") {
      return Promise.resolve({
        mode: "degraded",
        persona: "friend",
        userMessage: "hello",
      });
    }
    if (routerMode === "cooldown") {
      return Promise.resolve({
        mode: "cooldown",
        persona: "friend",
        userMessage: "hello",
      });
    }
    // Live mode — return a mock stream result
    return Promise.resolve({
      mode: "live",
      provider: routerProvider,
      result: {
        response: Promise.resolve({}),
        fullStream: (async function* () {
          yield { type: "text-delta", text: "hello" };
          yield { type: "finish", finishReason: "stop" };
        })(),
        usage: Promise.resolve({ inputTokens: 10, outputTokens: 5 }),
      },
    });
  },
}));

// ── chat-context mock (avoids Sanity network calls) ────────────────────────

vi.mock("@/lib/chat-context", () => ({
  fetchCatalog: () =>
    Promise.resolve({
      projects: [],
      experience: [],
      skills: [],
      education: [],
      certifications: [],
      achievements: [],
    }),
  buildSystemPrompt: () => Promise.resolve("system prompt"),
}));

// ── chat-tools mock ────────────────────────────────────────────────────────

vi.mock("@/lib/chat-tools", () => ({
  buildChatTools: () => ({}),
}));

// ── chat-sanitizer mock ────────────────────────────────────────────────────

vi.mock("@/lib/chat-sanitizer", () => ({
  sanitizeChatText: (text: string) => ({
    cleanText: text,
    orbyMessage: null,
  }),
}));

// ── fixed-prompts mock ─────────────────────────────────────────────────────

vi.mock("@/lib/fixed-prompts", () => ({
  findFixedPrompt: () => null,
}));

// ── degraded-responses mock ────────────────────────────────────────────────

vi.mock("@/lib/degraded-responses", () => ({
  getDegradedNavigation: () => null,
  getDegradedOrbyMessage: () => null,
  getDegradedText: () => "I'm experiencing some issues right now.",
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(opts: { cookie?: string; origin?: string } = {}) {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: opts.origin ?? "http://localhost:3000",
      ...(opts.cookie ? { Cookie: `chat_token=${opts.cookie}` } : {}),
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "hello" }],
    }),
  });
}

async function signTestToken(): Promise<string> {
  const { signToken } = await import("@/lib/chat-token");
  return signToken(Date.now());
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("POST /api/chat — security gates", () => {
  beforeAll(() => {
    process.env.CHAT_TOKEN_SECRET = TEST_SECRET;
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    process.env.CEREBRAS_API_KEY = "test-cerebras-key";
    process.env.GROQ_API_KEY = "test-groq-key";
    process.env.MISTRAL_API_KEY = "test-mistral-key";
  });

  beforeEach(() => {
    burstSuccess = true;
    dailySuccess = true;
    routerMode = "live";
    routerProvider = "cerebras";
  });

  // ── Test A: tokenless call → 401 ────────────────────────────────────────

  describe("Test A: tokenless request is rejected", () => {
    it("returns 401 when chat_token cookie is absent", async () => {
      mockCookieValue = undefined;
      const { POST } = await import("../route");
      const res = await POST(makeRequest());
      expect(res.status).toBe(401);
    });

    it("returns 401 when chat_token cookie is an empty string", async () => {
      mockCookieValue = "";
      const { POST } = await import("../route");
      const res = await POST(makeRequest({ cookie: "" }));
      expect(res.status).toBe(401);
    });

    it("returns 401 when chat_token cookie is a garbage value", async () => {
      mockCookieValue = "not-a-real-token";
      const { POST } = await import("../route");
      const res = await POST(makeRequest({ cookie: "not-a-real-token" }));
      expect(res.status).toBe(401);
    });
  });

  // ── Test B: rate limit exceeded → 429 ───────────────────────────────────

  describe("Test B: rate limit trips → 429", () => {
    it("returns 429 when both rate limiters are exhausted", async () => {
      const validToken = await signTestToken();
      mockCookieValue = validToken;
      burstSuccess = false;
      dailySuccess = false;

      const { POST } = await import("../route");
      const res = await POST(makeRequest({ cookie: validToken }));
      expect(res.status).toBe(429);
    });

    it("returns 429 when burst limit is exhausted (daily still fine)", async () => {
      const validToken = await signTestToken();
      mockCookieValue = validToken;
      burstSuccess = false;
      dailySuccess = true;

      const { POST } = await import("../route");
      const res = await POST(makeRequest({ cookie: validToken }));
      expect(res.status).toBe(429);
      expect(res.headers.get("Retry-After")).toBeTruthy();
    });
  });

  // ── Test C: Cerebras fails → Groq fallback → 200 ────────────────────────

  describe("Test C: provider failover", () => {
    it("returns 200 via Groq when Cerebras fails (model router handles fallback)", async () => {
      routerMode = "live";
      routerProvider = "groq";
      mockCookieValue = await signTestToken();

      const { POST } = await import("../route");
      const res = await POST(makeRequest({ cookie: mockCookieValue }));
      expect(res.status).toBe(200);
      expect(res.headers.get("X-Orby-Provider")).toBe("groq");
    });
  });

  // ── Test D: all providers exhausted → degraded mode → 200 ──────────────

  describe("Test D: all providers exhausted → degraded mode", () => {
    it("returns 200 with text delta in degraded mode", async () => {
      routerMode = "degraded";
      mockCookieValue = await signTestToken();

      const { POST } = await import("../route");
      const res = await POST(makeRequest({ cookie: mockCookieValue }));
      expect(res.status).toBe(200);
      expect(res.headers.get("X-Orby-Provider")).toBe("degraded");

      const body = await res.text();
      expect(body).toMatch(/^0:/m); // has a text-delta line
      expect(body).not.toMatch(/^e:/m); // no error line
    });
  });

  // ── Test E: origin check rejects unknown origins ────────────────────────

  describe("Test E: origin allowlist enforcement", () => {
    it("returns 403 for unknown origin", async () => {
      mockCookieValue = await signTestToken();
      const { POST } = await import("../route");
      const res = await POST(
        makeRequest({ cookie: mockCookieValue, origin: "https://evil.com" }),
      );
      expect(res.status).toBe(403);
    });
  });
});
