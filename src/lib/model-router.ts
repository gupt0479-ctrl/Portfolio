/**
 * model-router.ts — Cerebras → Groq → Mistral → degraded mode
 *
 * Tries each OpenAI-compatible provider in order. Budget tiering (per session,
 * Upstash-backed) determines the starting provider:
 *   - Messages 1–10: start at Cerebras (startIndex = 0)
 *   - Messages 11+:  start at Groq, skip Cerebras (startIndex = 1)
 *
 * Per-provider failover cooldown (30 s, Upstash-backed) prevents hammering a
 * provider that just returned a quota / 5xx error.
 *
 * Important: `streamText` in AI SDK v6 is lazy — it only calls the provider
 * when the stream is consumed. Awaiting `result.response` forces the initial
 * API call and rejects immediately if it fails (auth, quota, network), which
 * lets us switch providers BEFORE any byte is sent to the client.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { Redis } from "@upstash/redis";
import { type ModelMessage, type StopCondition, streamText } from "ai";
import type { ChatTools } from "@/lib/chat-tools";
import type { Persona } from "@/lib/personas";

// ---------------------------------------------------------------------------
// Upstash Redis (stateless REST — safe to instantiate here and in route.ts)
// ---------------------------------------------------------------------------

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ---------------------------------------------------------------------------
// Provider chain
// ---------------------------------------------------------------------------

type ProviderConfig = {
  name: "cerebras" | "groq" | "mistral";
  baseURL: string;
  apiKeyEnv: string;
  model: string;
};

const PROVIDER_CHAIN: ProviderConfig[] = [
  {
    name: "cerebras",
    baseURL: "https://api.cerebras.ai/v1",
    apiKeyEnv: "CEREBRAS_API_KEY",
    model: "gpt-oss-120b",
  },
  {
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    model: "llama-3.3-70b-versatile",
  },
  {
    name: "mistral",
    baseURL: "https://api.mistral.ai/v1",
    apiKeyEnv: "MISTRAL_API_KEY",
    model: "mistral-small",
  },
];

// Log missing keys at module load time (once per cold start)
for (const p of PROVIDER_CHAIN) {
  if (!process.env[p.apiKeyEnv]) {
    console.log(
      JSON.stringify({ event: "router.startup.no_key", provider: p.name }),
    );
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// The concrete return type of streamText when called with our ChatTools.
type LiveResult = ReturnType<typeof streamText<ChatTools>>;

export type RouterOpts = {
  system: string;
  messages: ModelMessage[];
  tools: ChatTools;
  maxOutputTokens: number;
  // StopCondition is contravariant — must be parameterised with ChatTools,
  // not the wider ToolSet, to satisfy streamText's signature.
  stopWhen: StopCondition<ChatTools>;
  abortSignal: AbortSignal;
  persona: Persona;
  userMessage: string;
  sessionId: string;
};

export type RouterResult =
  | {
      mode: "live";
      result: LiveResult;
      provider: "cerebras" | "groq" | "mistral";
    }
  | { mode: "degraded"; persona: Persona; userMessage: string };

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export async function routeChat(opts: RouterOpts): Promise<RouterResult> {
  const { persona, userMessage, sessionId, ...streamOpts } = opts;

  // ── Budget tier: determine startIndex ─────────────────────────────────────
  const countKey = `chat:session:${sessionId}:count`;
  const newCount = await redis.incr(countKey);
  await redis.expire(countKey, 3600);
  const preCount = newCount - 1; // count before this message
  const startIndex = preCount >= 10 ? 1 : 0; // skip Cerebras after 10 messages

  console.log(
    JSON.stringify({
      event: "router.turn",
      sessionId,
      messageCount: newCount,
      tier: startIndex === 0 ? "full" : "budget",
      startProvider: PROVIDER_CHAIN[startIndex]?.name ?? "none",
    }),
  );

  // ── Try each provider from startIndex ─────────────────────────────────────
  for (let i = startIndex; i < PROVIDER_CHAIN.length; i++) {
    const provider = PROVIDER_CHAIN[i];

    // Skip if env key is missing
    if (!process.env[provider.apiKeyEnv]) {
      console.log(
        JSON.stringify({
          event: "router.skip.no_key",
          provider: provider.name,
        }),
      );
      continue;
    }

    // Skip if provider is in cooldown
    const cooldownKey = `chat:cooldown:${provider.name}`;
    const cooled = await redis.exists(cooldownKey);
    if (cooled) {
      console.log(
        JSON.stringify({
          event: "router.skip.cooldown",
          provider: provider.name,
        }),
      );
      continue;
    }

    try {
      // .chat() forces /v1/chat/completions — Cerebras, Groq, and Mistral only
      // support the Chat Completions API, not the newer Responses API (/v1/responses)
      // that the default client() call targets.
      const client = createOpenAI({
        baseURL: provider.baseURL,
        apiKey: process.env[provider.apiKeyEnv]!,
      });

      const result = streamText({
        model: client.chat(provider.model),
        // Disable SDK retries — our own failover loop handles provider errors.
        maxRetries: 0,
        ...streamOpts,
      });

      // Awaiting result.response forces the initial API call and rejects if
      // the provider returns an error before we start streaming.
      await result.response;

      return {
        mode: "live",
        result,
        provider: provider.name,
      };
    } catch (err) {
      console.log(
        JSON.stringify({
          event: "router.fail",
          provider: provider.name,
          error: String(err),
        }),
      );
      // Put provider in 30-second cooldown regardless of error type
      await redis.set(cooldownKey, "1", { ex: 30 });
    }
  }

  // ── All legs failed → degraded mode ────────────────────────────────────────
  return { mode: "degraded", persona, userMessage };
}
