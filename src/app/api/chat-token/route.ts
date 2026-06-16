import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { signToken, verifyToken } from "@/lib/chat-token";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL = process.env.TURNSTILE_VERIFY_URL;

/**
 * Verify a Turnstile token with the siteverify Worker.
 * Returns true if the token is valid, false otherwise.
 */
async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY || !TURNSTILE_VERIFY_URL) {
    // If Turnstile is not configured, skip verification (dev/staging)
    console.warn("[chat-token] Turnstile not configured — skipping verification");
    return true;
  }

  try {
    const body: Record<string, string> = { token };
    if (remoteIp) body.remoteip = remoteIp;

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[chat-token] Turnstile verification failed:", err);
    return false;
  }
}

/**
 * GET /api/chat-token
 * Legacy path — returns existing valid token or 401 if Turnstile is enabled.
 * Kept for backward compat during transition; once Turnstile is live, this
 * only validates existing cookies (no new issuance without POST).
 */
export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const existing = cookieStore.get("chat_token")?.value;

  // If token exists and is valid, return 200
  if (existing && (await verifyToken(existing))) {
    return new NextResponse(null, { status: 200 });
  }

  // If Turnstile is configured, do NOT issue tokens via GET (require POST with token)
  if (TURNSTILE_SECRET_KEY && TURNSTILE_VERIFY_URL) {
    return new NextResponse(null, { status: 401 });
  }

  // Turnstile not configured (dev mode) — issue token freely
  const token = await signToken(Date.now());
  const res = new NextResponse(null, { status: 200 });
  res.cookies.set("chat_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600,
    path: "/",
  });
  return res;
}

/**
 * POST /api/chat-token
 * Primary path — verifies Turnstile token BEFORE issuing HMAC cookie.
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const existing = cookieStore.get("chat_token")?.value;

  // If token already valid, skip re-verification
  if (existing && (await verifyToken(existing))) {
    return new NextResponse(null, { status: 200 });
  }

  // Parse the Turnstile token from the request body
  let turnstileToken: string | undefined;
  try {
    const body = (await req.json()) as { turnstileToken?: string };
    turnstileToken = body.turnstileToken;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // Turnstile verification gate — BEFORE issuing HMAC cookie
  if (TURNSTILE_SECRET_KEY && TURNSTILE_VERIFY_URL) {
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Turnstile token required" },
        { status: 400 },
      );
    }

    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const isHuman = await verifyTurnstile(turnstileToken, clientIp || undefined);
    if (!isHuman) {
      return NextResponse.json(
        { error: "Turnstile verification failed" },
        { status: 403 },
      );
    }
  }

  // Turnstile passed (or not configured) — issue HMAC cookie
  const token = await signToken(Date.now());
  const res = new NextResponse(null, { status: 200 });
  res.cookies.set("chat_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600,
    path: "/",
  });
  return res;
}
