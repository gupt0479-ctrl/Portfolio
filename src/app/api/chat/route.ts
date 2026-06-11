import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type ModelMessage, stepCountIs } from "ai";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildSystemPrompt, fetchCatalog } from "@/lib/chat-context";
import { verifyToken } from "@/lib/chat-token";
import { buildChatTools } from "@/lib/chat-tools";
import {
  getDegradedNavigation,
  getDegradedText,
} from "@/lib/degraded-responses";
import { routeChat } from "@/lib/model-router";
import { PERSONAS, type Persona } from "@/lib/personas";

// ---------------------------------------------------------------------------
// Singletons — constructed once per cold start, reused across requests
// ---------------------------------------------------------------------------

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const burstLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "chat:burst",
});

const dailyLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "24 h"),
  prefix: "chat:daily",
});

// ---------------------------------------------------------------------------
// Scraper / bot user-agents to block
// ---------------------------------------------------------------------------

const BLOCKED_UA =
  /GPTBot|CCBot|Claude-Web|anthropic-ai|Googlebot|Bingbot|facebookexternalhit|Twitterbot|SemrushBot|AhrefsBot|MJ12bot|DotBot/i;

// ---------------------------------------------------------------------------
// Allowed origins
// ---------------------------------------------------------------------------

function isAllowedOrigin(
  origin: string | null,
  referer: string | null,
): boolean {
  const candidates: string[] = [
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (base) candidates.push(base);

  function check(value: string): boolean {
    if (candidates.includes(value)) return true;
    // Allow any Vercel preview deployment
    try {
      const url = new URL(value);
      return url.hostname.endsWith(".vercel.app");
    } catch {
      return false;
    }
  }

  if (origin && check(origin)) return true;
  if (referer) {
    try {
      return check(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Block scraper user-agents
  const ua = req.headers.get("user-agent") ?? "";
  if (BLOCKED_UA.test(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Origin / Referer check
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (!isAllowedOrigin(origin, referer)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 3. HMAC session token verification
  const cookieStore = await cookies();
  const token = cookieStore.get("chat_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 4. Parse body
  let messages: unknown;
  let rawPersona: unknown;
  try {
    ({ messages, persona: rawPersona } = await req.json());
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const persona: Persona = PERSONAS.includes(rawPersona as Persona)
    ? (rawPersona as Persona)
    : "friend";

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // 5. Rate limiting — burst then daily
  const [burst, daily] = await Promise.all([
    burstLimit.limit(ip),
    dailyLimit.limit(ip),
  ]);

  if (!burst.success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((burst.reset - Date.now()) / 1000)),
        "X-RateLimit-Limit": String(burst.limit),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  if (!daily.success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((daily.reset - Date.now()) / 1000)),
        "X-RateLimit-Limit": String(daily.limit),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  // 6. Build context — catalog, system prompt, tools
  const catalog = await fetchCatalog();
  const [systemPrompt, tools] = await Promise.all([
    buildSystemPrompt(persona, catalog),
    Promise.resolve(buildChatTools(catalog)),
  ]);

  // 7. Extract last user message text for degraded-mode intent detection
  const lastMsg = messages.at(-1) as
    | { role?: string; content?: unknown }
    | undefined;
  const userMessage =
    typeof lastMsg?.content === "string" ? lastMsg.content : "";

  // 8. Route: Gemini → Groq → degraded
  const routeResult = await routeChat({
    system: systemPrompt,
    messages: messages as ModelMessage[],
    tools,
    maxOutputTokens: 800,
    stopWhen: stepCountIs(5),
    abortSignal: req.signal,
    persona,
    userMessage,
  });

  console.log(
    JSON.stringify({
      event: "chat.request",
      model: routeResult.mode === "live" ? routeResult.provider : "degraded",
      persona,
      ip,
    }),
  );

  const encoder = new TextEncoder();
  const turnStart = Date.now();

  // Stream text deltas AND tool results to the frontend using prefix-encoded lines.
  // Format (one JSON-encoded value per line):
  //   0:"text fragment"\n          — text delta
  //   a:{toolCallId,toolName,result}\n — tool result
  //   d:{finishReason}\n           — finish
  //   e:{error}\n                  — error
  const stream = new ReadableStream({
    async start(controller) {
      // ── Degraded mode ────────────────────────────────────────────────────
      if (routeResult.mode === "degraded") {
        const sectionId = getDegradedNavigation(routeResult.userMessage);
        if (sectionId) {
          controller.enqueue(
            encoder.encode(
              `a:${JSON.stringify({
                toolCallId: "deg-nav",
                toolName: "navigate",
                result: { ok: true, sectionId },
              })}\n`,
            ),
          );
        }
        controller.enqueue(
          encoder.encode(
            `0:${JSON.stringify(getDegradedText(routeResult.persona, routeResult.userMessage))}\n`,
          ),
        );
        controller.enqueue(
          encoder.encode(`d:${JSON.stringify({ finishReason: "degraded" })}\n`),
        );
        controller.close();
        return;
      }

      // ── Live mode (Gemini or Groq) ───────────────────────────────────────
      try {
        for await (const part of routeResult.result.fullStream) {
          if (part.type === "text-delta") {
            controller.enqueue(
              encoder.encode(`0:${JSON.stringify(part.text)}\n`),
            );
          } else if (part.type === "tool-result") {
            controller.enqueue(
              encoder.encode(
                `a:${JSON.stringify({
                  toolCallId: part.toolCallId,
                  toolName: part.toolName,
                  result: part.output,
                })}\n`,
              ),
            );
          } else if (part.type === "finish") {
            controller.enqueue(
              encoder.encode(
                `d:${JSON.stringify({ finishReason: part.finishReason })}\n`,
              ),
            );
          }
        }
        // Log usage after stream is fully consumed.
        // Wrap in Promise.resolve() because PromiseLike doesn't expose .catch.
        Promise.resolve(routeResult.result.usage)
          .then((usage) => {
            console.log(
              JSON.stringify({
                event: "chat.turn.complete",
                model: routeResult.provider,
                persona,
                inputTokens: usage?.inputTokens,
                outputTokens: usage?.outputTokens,
                latencyMs: Date.now() - turnStart,
              }),
            );
          })
          .catch(() => {});
      } catch (err) {
        controller.enqueue(
          encoder.encode(`e:${JSON.stringify({ error: String(err) })}\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  const response = new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
  response.headers.set("X-RateLimit-Remaining-Daily", String(daily.remaining));
  return response;
}
