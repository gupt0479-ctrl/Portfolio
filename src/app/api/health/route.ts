import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const PROVIDER_KEYS: Record<string, string> = {
  cerebras: "CEREBRAS_API_KEY",
  groq: "GROQ_API_KEY",
  mistral: "MISTRAL_API_KEY",
};

export async function GET() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return NextResponse.json(
      { ok: false, error: "Upstash env not configured" },
      { status: 503 },
    );
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Redis ping
  let cacheOk = false;
  try {
    await redis.ping();
    cacheOk = true;
  } catch {
    // unreachable
  }

  // Per-provider status
  const providers: Record<
    string,
    { keyPresent: boolean; inCooldown: boolean; available: boolean }
  > = {};

  for (const [name, envKey] of Object.entries(PROVIDER_KEYS)) {
    const keyPresent = Boolean(process.env[envKey]);
    let inCooldown = false;
    if (cacheOk) {
      try {
        const hit = await redis.exists(`chat:cooldown:${name}`);
        inCooldown = hit > 0;
      } catch {
        // ignore
      }
    }
    providers[name] = {
      keyPresent,
      inCooldown,
      available: keyPresent && !inCooldown,
    };
  }

  // Budget-tier rules (static — applies per session message count)
  const budgetTier = {
    messages_1_to_10: "cerebras → groq → mistral → degraded",
    messages_11_plus: "groq → mistral → degraded",
  };

  return NextResponse.json({
    ok: true,
    cache: { ok: cacheOk },
    providers,
    budgetTier,
  });
}
