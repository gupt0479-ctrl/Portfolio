"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Invisible Cloudflare Turnstile widget + chat token initializer.
 *
 * Flow:
 * 1. Loads the Turnstile script once
 * 2. Renders an invisible challenge (no UI for real users)
 * 3. On token received, sends it to /api/chat-token for verification
 * 4. Server verifies with the siteverify Worker, then issues the HMAC cookie
 */
export function ChatTokenInit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Fetch the chat token using the Turnstile response token
  const requestChatToken = useCallback(async (turnstileToken: string) => {
    try {
      await fetch("/api/chat-token", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken }),
      });
    } catch {
      // Silent failure — chat will degrade gracefully without the HMAC cookie
    }
  }, []);

  // Load the Turnstile script
  useEffect(() => {
    // If no site key configured, fall back to the old behavior (no Turnstile)
    if (!siteKey) {
      fetch("/api/chat-token", { credentials: "same-origin" }).catch(() => {});
      return;
    }

    // Check if script already loaded
    if (window.turnstile) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove widget if it exists
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  // Render the invisible widget once the script is loaded
  useEffect(() => {
    if (!scriptLoaded || !siteKey || !containerRef.current || !window.turnstile)
      return;

    // Avoid double-rendering
    if (widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action: "chat-token",
      size: "invisible",
      callback: (token: string) => {
        requestChatToken(token);
      },
      "error-callback": () => {
        // On error, fall back to tokenless request (server will reject gracefully)
        console.warn("[Turnstile] Challenge failed — chat may be limited");
      },
      "expired-callback": () => {
        // Token expired — re-execute for fresh token
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    });
  }, [scriptLoaded, siteKey, requestChatToken]);

  // Hidden container for the invisible Turnstile widget
  return <div ref={containerRef} className="hidden" aria-hidden="true" />;
}

// Type augmentation for the Turnstile global
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}
