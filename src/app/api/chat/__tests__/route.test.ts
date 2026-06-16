/**
 * Security gate + model router tests for POST /api/chat.
 *
 * Test A: tokenless call → 401
 * Test B: rate limit exceeded → 429
 * Test C: Gemini quota exhausted → Groq fallback → 200
 * Test D: both providers exhausted → degraded mode → 200
 */

import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it, vi } from "vitest";

// ── Shared test constants ──────────────────────────────────────────────────

const TEST_SECRET = "test-secret-that-is-long-enough-32c";

// ── next/headers mock (cookies()) ─────────────────────────────────────────

// We start with no cookie; tests that need one override this directly.
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
  Redis: class {},
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

// ── AI SDK provider mocks ──────────────────────────────────────────────────

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () => () => "gemini-2.5-flash",
}));

vi.mock("@ai-sdk/groq", () => ({
  createGroq: () => () => "llama-3.3-70b-versatile",
}));

// ── Controlled streamText mock ─────────────────────────────────────────────
// Tests A & B never reach streamText (they fail at an earlier gate).
// Tests C & D exercise the quota-error fallback path.

let geminiQuota = false; // true = simulate quota/429 error for Gemini
let groqQuota = false; // true = simulate quota/429 error for Groq

vi.mock("ai", () => ({
  streamText: ({ model }: { model: string }) => {
    const isGroq = model === "llama-3.3-70b-versatile";
    const shouldFail = isGroq ? groqQuota : geminiQuota;

    if (shouldFail) {
      const quotaErr = Object.assign(new Error("quota exhausted"), {
        status: 429,
      });
      return {
        response: Promise.reject(quotaErr),
        fullStream: (async function* () {})(),
        usage: Promise.resolve({ inputTokens: 0, outputTokens: 0 }),
      };
    }

    return {
      response: Promise.resolve({}),
      fullStream: (async function* () {
        yield { type: "text-delta", text: "hello" };
        yield { type: "finish", finishReason: "stop" };
      })(),
      usage: Promise.resolve({ inputTokens: 10, outputTokens: 5 }),
    };
  },
  stepCountIs: () => ({}),
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
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.GROQ_API_KEY = "test-groq-key";
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

      // Restore for other tests
      burstSuccess = true;
      dailySuccess = true;
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

      burstSuccess = true;
    });
  });

  // ── Test C: Gemini quota → Groq fallback → 200 ──────────────────────────

  describe("Test C: Gemini quota exhausted → Groq fallback", () => {
    it("returns 200 via Groq when Gemini quota is exhausted", async () => {
      geminiQuota = true;
      groqQuota = false;
      mockCookieValue = await signTestToken();
      burstSuccess = true;
      dailySuccess = true;

      const { POST } = await import("../route");
      const res = await POST(makeRequest({ cookie: mockCookieValue }));
      expect(res.status).toBe(200);

      geminiQuota = false;
    });
  });

  // ── Test D: both providers exhausted → degraded mode → 200 ──────────────

  describe("Test D: both providers exhausted → degraded mode", () => {
    it("returns 200 with text delta and no error line in degraded mode", async () => {
      geminiQuota = true;
      groqQuota = true;
      mockCookieValue = await signTestToken();
      burstSuccess = true;
      dailySuccess = true;

      const { POST } = await import("../route");
      const res = await POST(makeRequest({ cookie: mockCookieValue }));
      expect(res.status).toBe(200);

      const body = await res.text();
      expect(body).toMatch(/^0:/m); // has a text-delta line
      expect(body).not.toMatch(/^e:/m); // no error line

      geminiQuota = false;
      groqQuota = false;
    });
  });
});
