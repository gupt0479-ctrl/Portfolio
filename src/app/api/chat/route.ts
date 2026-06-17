import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type ModelMessage, stepCountIs } from "ai";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildSystemPrompt, fetchCatalog } from "@/lib/chat-context";
import { sanitizeChatText } from "@/lib/chat-sanitizer";
import { decodeToken, verifyToken } from "@/lib/chat-token";
import { buildChatTools } from "@/lib/chat-tools";
import {
  getDegradedNavigation,
  getDegradedOrbyMessage,
  getDegradedText,
} from "@/lib/degraded-responses";
import { findFixedPrompt } from "@/lib/fixed-prompts";
import { routeChat } from "@/lib/model-router";
import { PERSONAS, type Persona } from "@/lib/personas";

// ---------------------------------------------------------------------------
// Input sanitization — strip HTML tags from user messages before AI layer
// ---------------------------------------------------------------------------

const HTML_TAG_RE = /<[^>]*>/g;
function stripHtml(s: string): string {
  return s.replace(HTML_TAG_RE, "");
}

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
  limiter: Ratelimit.slidingWindow(100, "24 h"),
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) candidates.push(siteUrl);

  // VERCEL_URL is set by Vercel for each specific deployment (not client-controlled)
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) candidates.push(`https://${vercelUrl}`);

  function check(value: string): boolean {
    return candidates.includes(value);
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
// Cache helpers
// ---------------------------------------------------------------------------

function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .slice(0, 200);
}

type CachedEntry = {
  text: string;
  navigate: {
    sectionId: string;
    orbyMessage: string | null;
    itemSlug?: string | null;
    itemIndex?: number | null;
  } | null;
  /** Non-navigate tool results (showProject, showExperience, lookupFact) to replay on cache hit */
  toolResults?: Array<{
    toolCallId: string;
    toolName: string;
    result: unknown;
  }>;
};

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

  // Extract sessionId from token payload (already verified above)
  const decoded = decodeToken(token);
  const sessionId = decoded ? String(decoded.iat) : token.slice(0, 32);

  // 4. Parse body
  let messages: unknown;
  let rawPersona: unknown;
  try {
    ({ messages, persona: rawPersona } = await req.json());
  } catch {
    console.log(
      JSON.stringify({
        event: "chat.rejected",
        reason: "parse_error",
        sessionId,
      }),
    );
    return new NextResponse("Bad Request", { status: 400 });
  }
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > 20
  ) {
    console.log(
      JSON.stringify({
        event: "chat.rejected",
        reason: "invalid_messages_array",
        sessionId,
      }),
    );
    return new NextResponse("Bad Request", { status: 400 });
  }
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) {
      console.log(
        JSON.stringify({
          event: "chat.rejected",
          reason: "invalid_message_shape",
          sessionId,
        }),
      );
      return new NextResponse("Bad Request", { status: 400 });
    }
    const m = msg as Record<string, unknown>;
    if (m.role === "system") {
      console.log(
        JSON.stringify({
          event: "chat.rejected",
          reason: "system_role_injection",
          sessionId,
        }),
      );
      return new NextResponse("Bad Request", { status: 400 });
    }
    if (typeof m.content !== "string" || m.content.length > 4000) {
      console.log(
        JSON.stringify({
          event: "chat.rejected",
          reason: "content_invalid",
          sessionId,
        }),
      );
      return new NextResponse("Bad Request", { status: 400 });
    }
    // Input validation — sanitize HTML before AI layer
    m.content = stripHtml(m.content as string);
  }

  const persona: Persona = PERSONAS.includes(rawPersona as Persona)
    ? (rawPersona as Persona)
    : "friend";

  // x-real-ip is set by Vercel's edge to the true client IP (not client-controlled).
  // Fall back to the rightmost x-forwarded-for entry which Vercel appends.
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown";

  // 5. Dev IP bypass — skip rate limiting for the configured bypass IP
  const devBypassIp = process.env.DEV_BYPASS_IP;
  const isDevBypass = Boolean(devBypassIp && ip === devBypassIp);

  let dailyRemaining = 999;

  if (!isDevBypass) {
    // Rate limiting — burst then daily
    // Wrapped in try/catch: if Upstash is unreachable, degrade gracefully
    // rather than returning 500 to the user.
    try {
      const [burst, daily] = await Promise.all([
        burstLimit.limit(ip),
        dailyLimit.limit(ip),
      ]);

      dailyRemaining = daily.remaining;

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
    } catch (err) {
      // Redis unavailable — log and allow the request rather than blocking users
      console.warn("[chat] Upstash unreachable — rate limiting skipped", err);
    }
  }

  // 6. Extract last user message text for cache key, degraded-mode intent, and logging
  const lastMsg = messages.at(-1) as
    | { role?: string; content?: unknown }
    | undefined;
  const userMessage =
    typeof lastMsg?.content === "string" ? lastMsg.content : "";

  // 6a. Fixed-prompt detection (before catalog fetch to short-circuit early on cache hit)
  const fixedPrompt = findFixedPrompt(persona, userMessage);

  // 7. Build context — catalog, system prompt, tools
  const catalog = await fetchCatalog();
  const [baseSystemPrompt, tools] = await Promise.all([
    buildSystemPrompt(persona, catalog),
    Promise.resolve(buildChatTools(catalog)),
  ]);

  // Augment system prompt for fixed prompts: inject deterministic navTarget
  // and answerBrief so the model writes on-brief without guessing the section.
  let systemPrompt = baseSystemPrompt;
  if (fixedPrompt) {
    const { navTarget, answerBrief } = fixedPrompt;
    const navDirective = [
      `FIXED PROMPT — NAVIGATION IS DETERMINISTIC: For this specific question, you MUST call navigate(${JSON.stringify(navTarget)}) exactly as specified. Do NOT choose a different section or item.`,
      `ANSWER BRIEF (guides your prose — do NOT copy verbatim): ${answerBrief}`,
    ].join("\n");
    systemPrompt = `${baseSystemPrompt}\n\n${navDirective}`;
  }

  // 8. Upstash exact-match cache check (before calling any model)
  // Fixed prompts use their promptId as the cache key for higher precision.
  const normalizedQ = normalizeQuestion(userMessage);
  const cacheKey = fixedPrompt
    ? `chat:v2:fixed:${fixedPrompt.persona}:${fixedPrompt.promptId}`
    : `chat:v2:${persona}:${normalizedQ}`;

  if (normalizedQ.length > 0) {
    const cached = await redis.get<CachedEntry>(cacheKey);
    if (cached) {
      const encoder = new TextEncoder();
      const cachedStream = new ReadableStream({
        start(controller) {
          // Emit navigation tool result if cached
          if (cached.navigate) {
            controller.enqueue(
              encoder.encode(
                `a:${JSON.stringify({
                  toolCallId: "cache-nav",
                  toolName: "navigate",
                  result: {
                    ok: true,
                    sectionId: cached.navigate.sectionId,
                    orbyMessage: cached.navigate.orbyMessage,
                    itemSlug: cached.navigate.itemSlug ?? null,
                    itemIndex: cached.navigate.itemIndex ?? null,
                  },
                })}\n`,
              ),
            );
          }
          // Emit non-navigate tool results (showProject, showExperience, etc.)
          if (cached.toolResults) {
            for (const tr of cached.toolResults) {
              controller.enqueue(
                encoder.encode(
                  `a:${JSON.stringify({
                    toolCallId: tr.toolCallId,
                    toolName: tr.toolName,
                    result: tr.result,
                  })}\n`,
                ),
              );
            }
          }
          // Emit text delta
          controller.enqueue(
            encoder.encode(`0:${JSON.stringify(cached.text)}\n`),
          );
          // Emit finish
          controller.enqueue(
            encoder.encode(`d:${JSON.stringify({ finishReason: "cache" })}\n`),
          );
          controller.close();
        },
      });

      const resp = new Response(cachedStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
      resp.headers.set("X-Orby-Provider", "cache");
      resp.headers.set("X-RateLimit-Remaining-Daily", String(dailyRemaining));
      return resp;
    }
  }

  // 9. Route: Cerebras → Groq → Mistral → degraded
  const routeResult = await routeChat({
    system: systemPrompt,
    messages: messages as ModelMessage[],
    tools,
    maxOutputTokens: 800,
    stopWhen: stepCountIs(5),
    abortSignal: req.signal,
    persona,
    userMessage,
    sessionId,
  });

  console.log(
    JSON.stringify({
      event: "chat.request",
      provider:
        routeResult.mode === "live"
          ? routeResult.provider
          : routeResult.mode === "cooldown"
            ? "cooldown"
            : "degraded",
      mode: routeResult.mode,
      persona,
      sessionId,
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
      // ── Cooldown mode — all providers rate-limited ────────────────────────
      if (routeResult.mode === "cooldown") {
        controller.enqueue(
          encoder.encode(
            `0:${JSON.stringify("Hit rate limits, on a cooldown. Try again in sometime.")}\n`,
          ),
        );
        controller.enqueue(
          encoder.encode(`d:${JSON.stringify({ finishReason: "cooldown" })}\n`),
        );
        controller.close();
        return;
      }

      // ── Degraded mode ────────────────────────────────────────────────────
      if (routeResult.mode === "degraded") {
        const sectionId = getDegradedNavigation(routeResult.userMessage);
        if (sectionId) {
          controller.enqueue(
            encoder.encode(
              `a:${JSON.stringify({
                toolCallId: "deg-nav",
                toolName: "navigate",
                result: {
                  ok: true,
                  sectionId,
                  orbyMessage: getDegradedOrbyMessage(
                    routeResult.persona,
                    sectionId,
                  ),
                },
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

      // ── Live mode (Cerebras, Groq, or Mistral) ───────────────────────────
      // Accumulate response for cache write after stream completes
      let accText = "";
      let accNav: CachedEntry["navigate"] = null;
      const accToolResults: NonNullable<CachedEntry["toolResults"]> = [];
      let hasOrbyMessage = false;

      // Inline text buffer: holds back text fragments that look like the start
      // of a leaked JSON tool call. Flushed when we can confirm it's safe text
      // or at finish via the sanitizer.
      let textBuffer = "";
      const JSON_START_RE = /\{[\s\n]*"(?:tool|function|name|sectionId|navigate|ok|orbyMessage|action|records)/;

      function flushTextBuffer() {
        if (textBuffer.length > 0) {
          controller.enqueue(
            encoder.encode(`0:${JSON.stringify(textBuffer)}\n`),
          );
          textBuffer = "";
        }
      }

      try {
        for await (const part of routeResult.result.fullStream) {
          if (part.type === "text-delta") {
            accText += part.text;
            textBuffer += part.text;

            // If buffer has a complete JSON object that looks like a tool call,
            // hold it (don't send). It'll be stripped at finish by the sanitizer.
            if (JSON_START_RE.test(textBuffer)) {
              // Check if we have a complete JSON object (balanced braces)
              const openBraces = (textBuffer.match(/\{/g) || []).length;
              const closeBraces = (textBuffer.match(/\}/g) || []).length;
              if (closeBraces >= openBraces && openBraces > 0) {
                // Complete JSON object detected — suppress entirely
                // (sanitizer will strip it at finish and emit clean text via `t:`)
                textBuffer = "";
              } else if (textBuffer.length > 2000) {
                // Safety cap: if buffer exceeds 2KB without braces balancing,
                // it's not a real JSON leak — flush to avoid holding forever.
                flushTextBuffer();
              }
              // Otherwise keep buffering — it's an incomplete JSON fragment
            } else {
              // No JSON-like pattern — safe to flush to client
              flushTextBuffer();
            }
          } else if (part.type === "tool-result") {
            // Flush buffered text only if it's NOT a suspected JSON leak.
            // If it IS a JSON pattern, leave it — the sanitizer will strip it at finish.
            if (textBuffer.length > 0 && !JSON_START_RE.test(textBuffer)) {
              flushTextBuffer();
            }
            console.log(
              JSON.stringify({
                event: "chat.tool",
                tool: part.toolName,
                toolCallId: part.toolCallId,
                persona,
                sessionId,
              }),
            );
            if (part.toolName === "navigate") {
              const navOutput = part.output as {
                sectionId?: string;
                orbyMessage?: string | null;
                itemSlug?: string | null;
                itemIndex?: number | null;
              };
              if (navOutput?.sectionId) {
                accNav = {
                  sectionId: navOutput.sectionId,
                  orbyMessage: navOutput.orbyMessage ?? null,
                  itemSlug: navOutput.itemSlug ?? null,
                  itemIndex: navOutput.itemIndex ?? null,
                };
                if (navOutput.orbyMessage) hasOrbyMessage = true;
              }
            } else {
              // Accumulate non-navigate tool results for cache replay
              accToolResults.push({
                toolCallId: part.toolCallId,
                toolName: part.toolName,
                result: part.output,
              });
            }
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
            // ── Groq tool_use_failed detection (in-stream) ────────────────
            // Groq can emit "Failed to call a function" as the text content
            // after a successful HTTP 200. Detect and surface as an error.
            if (
              routeResult.provider === "groq" &&
              (accText.includes("Failed to call a function") ||
                accText.includes("tool_use_failed") ||
                accText.includes("failed_generation"))
            ) {
              console.log(
                JSON.stringify({
                  event: "chat.tool_use_failed.stream",
                  provider: "groq",
                  persona,
                  sessionId,
                }),
              );
              // Emit a user-friendly message instead of the error text
              controller.enqueue(
                encoder.encode(
                  `t:${JSON.stringify("Couldn't reach Orby. Try again?")}\n`,
                ),
              );
              controller.enqueue(
                encoder.encode(
                  `d:${JSON.stringify({ finishReason: "error" })}\n`,
                ),
              );
              break;
            }

            // Do NOT flush the text buffer here — it may contain leaked JSON
            // that should be stripped. The sanitizer handles the full text and
            // emits a `t:` replacement line that the frontend uses.

            // Sanitize accumulated text to strip any pseudo-tool-call markup
            const sanitized = sanitizeChatText(accText);

            // Always emit the final clean text as a replacement (`t:` line)
            // if either: (a) the sanitizer changed something, or (b) we held
            // back buffered text that the client never received via `0:` lines.
            if (sanitized.cleanText !== accText || textBuffer.length > 0) {
              controller.enqueue(
                encoder.encode(`t:${JSON.stringify(sanitized.cleanText)}\n`),
              );
            }
            textBuffer = "";

            // If the model leaked a navigate result as text (instead of calling
            // the tool API), emit a synthetic navigate tool result so the frontend
            // still scrolls to the correct section.
            if (sanitized.extractedSectionId && !accNav) {
              accNav = {
                sectionId: sanitized.extractedSectionId,
                orbyMessage: sanitized.orbyMessage,
                itemSlug: null,
                itemIndex: null,
              };
              controller.enqueue(
                encoder.encode(
                  `a:${JSON.stringify({
                    toolCallId: "sanitizer-nav",
                    toolName: "navigate",
                    result: {
                      ok: true,
                      sectionId: sanitized.extractedSectionId,
                      orbyMessage: sanitized.orbyMessage,
                      itemSlug: null,
                      itemIndex: null,
                    },
                  })}\n`,
                ),
              );
            }

            // If orbyMessage was emitted as text (model ignored tool call API),
            // forward it as a separate event so the frontend can wire it to
            // Orby's speech bubble. Only emit if no tool call already carried it.
            if (sanitized.orbyMessage && !hasOrbyMessage) {
              controller.enqueue(
                encoder.encode(`m:${JSON.stringify(sanitized.orbyMessage)}\n`),
              );
            }

            controller.enqueue(
              encoder.encode(
                `d:${JSON.stringify({ finishReason: part.finishReason })}\n`,
              ),
            );

            // Write clean text to cache after finish (fire-and-forget)
            const textForCache = sanitized.cleanText || accText;
            if (normalizedQ.length > 0 && textForCache.length > 0) {
              redis
                .set<CachedEntry>(
                  cacheKey,
                  {
                    text: textForCache,
                    navigate: accNav,
                    toolResults:
                      accToolResults.length > 0 ? accToolResults : undefined,
                  },
                  { ex: 86400 },
                )
                .catch(() => {});
            }
          }
        }
        // Log usage after stream is fully consumed.
        Promise.resolve(routeResult.result.usage)
          .then((usage) => {
            console.log(
              JSON.stringify({
                event: "chat.turn.complete",
                model: routeResult.provider,
                persona,
                sessionId,
                inputTokens: usage?.inputTokens,
                outputTokens: usage?.outputTokens,
                latencyMs: Date.now() - turnStart,
              }),
            );
          })
          .catch(() => {});
      } catch (err) {
        console.error("chat.stream.error", err);
        controller.enqueue(
          encoder.encode(
            `e:${JSON.stringify({ error: "Stream error. Please try again." })}\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  const response = new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
  response.headers.set(
    "X-Orby-Provider",
    routeResult.mode === "live"
      ? routeResult.provider
      : routeResult.mode === "cooldown"
        ? "cooldown"
        : "degraded",
  );
  response.headers.set("X-RateLimit-Remaining-Daily", String(dailyRemaining));
  return response;
}
