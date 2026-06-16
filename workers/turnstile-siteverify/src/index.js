/**
 * Turnstile Siteverify Worker
 *
 * Proxies Turnstile token verification requests to Cloudflare's siteverify API.
 * Keeps the TURNSTILE_SECRET_KEY server-side (never exposed to browser).
 *
 * Endpoints:
 *   POST /           - Verify a Turnstile token
 *   POST /siteverify - Alias of /
 *   GET  /           - Health check
 *   GET  /health     - Health check
 *
 * Environment variables (set via wrangler secret / vars):
 *   TURNSTILE_SECRET_KEY  (secret)  - Widget secret key
 *   ALLOWED_ORIGIN        (var)     - CORS origin. Default: * (lock in prod)
 *   EXPECTED_HOSTNAME     (var)     - If set, reject hostname mismatches
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERSION = "1.0.0";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "*";

    // Determine CORS origin header
    let corsOrigin = "";
    if (allowedOrigin === "*") {
      corsOrigin = "*";
    } else if (origin === allowedOrigin) {
      corsOrigin = origin;
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health check
    const url = new URL(request.url);
    if (
      request.method === "GET" &&
      (url.pathname === "/" || url.pathname === "/health")
    ) {
      return Response.json(
        { ok: true, version: VERSION },
        { headers: corsHeaders },
      );
    }

    // Only POST for verification
    if (request.method !== "POST") {
      return Response.json(
        { success: false, error: "Method not allowed" },
        { status: 405, headers: corsHeaders },
      );
    }

    const secret = env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return Response.json(
        { success: false, error: "Server misconfigured: missing secret" },
        { status: 500, headers: corsHeaders },
      );
    }

    // Parse request body (JSON or form-encoded)
    let body;
    const contentType = request.headers.get("Content-Type") || "";
    try {
      if (contentType.includes("application/json")) {
        body = await request.json();
      } else {
        const formData = await request.formData();
        body = Object.fromEntries(formData.entries());
      }
    } catch {
      return Response.json(
        { success: false, "error-codes": ["bad-request"] },
        { status: 400, headers: corsHeaders },
      );
    }

    const { token, remoteip, idempotency_key } = body;
    if (!token) {
      return Response.json(
        { success: false, "error-codes": ["missing-input-response"] },
        { status: 400, headers: corsHeaders },
      );
    }

    // Forward to Cloudflare siteverify
    const start = Date.now();
    const verifyPayload = { secret, response: token };
    if (remoteip) verifyPayload.remoteip = remoteip;
    if (idempotency_key) verifyPayload.idempotency_key = idempotency_key;

    const upstream = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verifyPayload),
    });

    const result = await upstream.json();
    const elapsed = Date.now() - start;

    // Optional hostname verification
    if (
      env.EXPECTED_HOSTNAME &&
      result.hostname &&
      result.hostname !== env.EXPECTED_HOSTNAME
    ) {
      return Response.json(
        {
          success: false,
          "error-codes": ["hostname-mismatch"],
          _worker: { elapsed_ms: elapsed, version: VERSION },
        },
        { status: 403, headers: corsHeaders },
      );
    }

    return Response.json(
      { ...result, _worker: { elapsed_ms: elapsed, version: VERSION } },
      { headers: corsHeaders },
    );
  },
};
