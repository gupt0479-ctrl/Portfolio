import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    server: true,
    ai_primary: Boolean(process.env.CEREBRAS_API_KEY),
    ai_fallback: Boolean(process.env.GROQ_API_KEY),
    ai_tertiary: Boolean(process.env.MISTRAL_API_KEY),
    chat_secret: Boolean(process.env.CHAT_TOKEN_SECRET),
    upstash: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    sanity_token: Boolean(process.env.SANITY_API_TOKEN),
  };

  const allHealthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: allHealthy ? "ok" : "degraded",
      checks,
      ts: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 },
  );
}

// Prevent Next.js from caching this route
export const dynamic = "force-dynamic";
