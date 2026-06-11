/**
 * model-router.ts — Gemini → Groq → degraded mode
 *
 * Tries Gemini 2.5 Flash first. If it returns a quota / rate-limit error
 * (HTTP 429 or 503 with quota language) it falls through to Groq
 * llama-3.3-70b-versatile. If Groq is also exhausted we return a degraded
 * mode marker so the route handler can emit a pre-written persona answer
 * without touching the network again.
 *
 * Important: `streamText` in AI SDK v6 is lazy — it only calls the provider
 * when the stream is consumed. Awaiting `result.response` forces the initial
 * API call and rejects immediately if it fails (auth, quota, network), which
 * lets us switch providers BEFORE any byte is sent to the client.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { type ModelMessage, type StopCondition, streamText } from "ai";
import type { ChatTools } from "@/lib/chat-tools";
import type { Persona } from "@/lib/personas";

// ---------------------------------------------------------------------------
// Singletons — one instance per cold start
// ---------------------------------------------------------------------------

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// The concrete return type of streamText when called with our ChatTools.
// Using ReturnType avoids importing the Output namespace (which TS disallows
// as a generic argument) while staying fully type-safe.
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
};

export type RouterResult =
  | { mode: "live"; result: LiveResult; provider: "gemini" | "groq" }
  | { mode: "degraded"; persona: Persona; userMessage: string };

// ---------------------------------------------------------------------------
// Quota-error detection
// ---------------------------------------------------------------------------

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  return (
    e.status === 429 ||
    (e.status === 503 && /quota|resource_exhausted/i.test(e.message ?? ""))
  );
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export async function routeChat(opts: RouterOpts): Promise<RouterResult> {
  const { persona, userMessage, ...streamOpts } = opts;

  // ── Try Gemini 2.5 Flash ────────────────────────────────────────────────
  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      ...streamOpts,
    });
    // Awaiting result.response forces the initial API call and rejects if
    // the provider returns an error (quota, auth, network) before we stream.
    await result.response;
    return { mode: "live", result, provider: "gemini" };
  } catch (err) {
    if (!isQuotaError(err)) throw err;
  }

  // ── Try Groq llama-3.3-70b-versatile ────────────────────────────────────
  try {
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      ...streamOpts,
    });
    await result.response;
    return { mode: "live", result, provider: "groq" };
  } catch (err) {
    if (!isQuotaError(err)) throw err;
  }

  // ── Both exhausted — degraded mode ──────────────────────────────────────
  return { mode: "degraded", persona, userMessage };
}
