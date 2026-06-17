import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { signToken, verifyToken } from "@/lib/chat-token";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

// Call Cloudflare's siteverify directly — no custom Worker intermediary.
// This avoids the EXPECTED_HOSTNAME check in the Worker that blocks
// localhost and Vercel preview URLs.
const CF_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile token directly with Cloudflare's siteverify endpoint.
 */
async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn("[chat-token] TURNSTILE_SECRET_KEY not set — skipping verification");
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (remoteIp) formData.append("remoteip", remoteIp);

    const res = await fetch(CF_SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!res.ok) {
      console.error(`[chat-token] CF siteverify returned ${res.status}`);
      return false;
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      console.warn("[chat-token] Turnstile verification failed:", data["error-codes"]);
    }

    return data.success === true;
  } catch (err) {
    console.error("[chat-token] Turnstile verification error:", err);
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
  if (TURNSTILE_SECRET_KEY) {
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
  if (TURNSTILE_SECRET_KEY) {
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
