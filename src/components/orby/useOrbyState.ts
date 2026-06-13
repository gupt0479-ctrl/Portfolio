"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type OrbyState =
  | "intro"
  | "pointing"
  | "roaming"
  | "section-comment"
  | "exitingLeft"
  | "departingLeft"
  | "returningRight"
  | "goodbye"
  | "reducedMotion"
  | "chat-nav-home" // gliding home before programmatic scroll
  | "chat-nav-arrival"; // showing per-request arrival message

export interface OrbyStateResult {
  state: OrbyState;
  speechText: string | null;
  showArrow: boolean;
}

export interface PositionModifiers {
  sidebarOpen: boolean;
  isMobile: boolean;
}

const INTRO_COPY = [
  "Hi, I'm Orby. I bounce around this little corner of space.",
  "Hey, I'm Orby. I keep watch over the evidence nebula.",
  "I'm Orby. Tiny astronaut, large curiosity.",
] as const;

const LAB_HINT_COPY = [
  "Want the shortcut? The lab knows the lore.",
  "Tap the lab. It has the evidence files.",
  "Know more about Anant through AI. I found the cool button.",
  "The lab has receipts. I just point at things.",
] as const;

const SECTION_COPY = {
  projects:
    "Fair warning — some of these deploy links are on sabbatical. The real, live collection is at github.com/gupta-builds.",
  blog: "He's been converting browser tabs into an actual blog. The link appears here once it's live — I'm watching.",
  contact:
    "You orbited the whole thing. Reach out — I've been watching the evidence, and he's worth the message.",
} as const;

const GOODBYE_COPY = "See you around, spacefarer. ✌️";

const SECTION_TRIGGERS: Record<string, string> = {
  projects: SECTION_COPY.projects,
  blog: SECTION_COPY.blog,
  contact: SECTION_COPY.contact,
};

// Per-section observer config. Projects uses a low threshold (0.25) because the
// 3D slider makes it taller than the viewport — threshold:0.5 would never fire.
const SECTION_OBSERVER_CONFIG: Record<
  string,
  { threshold: number; rootMargin: string }
> = {
  projects: { threshold: 0.25, rootMargin: "0px 0px -5% 0px" },
  blog: { threshold: 0.4, rootMargin: "0px 0px -10% 0px" },
  contact: { threshold: 0.45, rootMargin: "0px 0px -10% 0px" },
};

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getScrollProgress(): number {
  if (typeof window === "undefined") return 0;
  const sh = document.documentElement.scrollHeight - window.innerHeight;
  return sh > 0 ? Math.min(Math.max(window.scrollY / sh, 0), 1) : 0;
}

/**
 * State machine for Orby. Returns state + speech text only.
 * Position is computed separately in Orby.tsx via a RAF animation loop.
 *
 * End-of-scroll flow:
 *   roaming → exitingLeft (progress 0.90-0.95, parks at left edge)
 *           → goodbye (progress >= 0.95, says farewell at left edge)
 *           → departingLeft (user scrolls up, slides off-screen left, 0.8s)
 *           → returningRight (teleports off-screen right, slides to home, 1.4s)
 *           → pointing (restart cycle)
 */
export function useOrbyState(_modifiers?: PositionModifiers): OrbyStateResult {
  const [reducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  const copyRef = useRef<{ intro: string; labHint: string } | null>(null);
  if (copyRef.current === null) {
    copyRef.current = {
      intro: pickRandom(INTRO_COPY),
      labHint: pickRandom(LAB_HINT_COPY),
    };
  }

  const [state, setState] = useState<OrbyState>(
    reducedMotion ? "reducedMotion" : "intro",
  );
  const [speechText, setSpeechText] = useState<string | null>(
    copyRef.current.intro,
  );
  const [showArrow, setShowArrow] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const firedSections = useRef<Set<string>>(new Set());
  const observersRef = useRef<IntersectionObserver[]>([]);
  const chatNavPendingRef = useRef<{
    observer: IntersectionObserver | null;
    timeoutId: ReturnType<typeof setTimeout> | null;
    cancelListeners: (() => void) | null;
  } | null>(null);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  // intro → pointing (5s)
  useEffect(() => {
    if (reducedMotion || state !== "intro") return;
    const timer = setTimeout(() => {
      setState("pointing");
      setSpeechText(copyRef.current?.labHint ?? null);
      setShowArrow(true);
    }, 5000);
    timersRef.current.push(timer);
    return () => clearTimeout(timer);
  }, [state, reducedMotion]);

  // pointing → roaming (4s timer fallback)
  useEffect(() => {
    if (reducedMotion || state !== "pointing") return;
    const timer = setTimeout(() => {
      setState("roaming");
      setSpeechText(null);
      setShowArrow(false);
    }, 4000);
    timersRef.current.push(timer);
    return () => clearTimeout(timer);
  }, [state, reducedMotion]);

  // departingLeft → returningRight (0.8s — enough time to slide off-screen left)
  useEffect(() => {
    if (reducedMotion || state !== "departingLeft") return;
    const timer = setTimeout(() => {
      setState("returningRight");
      setSpeechText(null);
    }, 800);
    timersRef.current.push(timer);
    return () => clearTimeout(timer);
  }, [state, reducedMotion]);

  // returningRight → pointing (1.4s — restart cycle after Orby slides in from right)
  useEffect(() => {
    if (reducedMotion || state !== "returningRight") return;
    const timer = setTimeout(() => {
      setState("pointing");
      setSpeechText(copyRef.current?.labHint ?? null);
      setShowArrow(true);
    }, 1400);
    timersRef.current.push(timer);
    return () => clearTimeout(timer);
  }, [state, reducedMotion]);

  // goodbye → departingLeft (5s auto-timer — departs even without user scrolling up)
  useEffect(() => {
    if (reducedMotion || state !== "goodbye") return;
    const timer = setTimeout(() => {
      setState("departingLeft");
      setSpeechText(null);
    }, 5000);
    timersRef.current.push(timer);
    return () => clearTimeout(timer);
  }, [state, reducedMotion]);

  // Scroll-based transitions — bidirectional
  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      const progress = getScrollProgress();
      const current = stateRef.current;

      // Forward transitions
      if (current === "pointing" && progress > 0.1) {
        clearTimers();
        setState("roaming");
        setSpeechText(null);
        setShowArrow(false);
        return;
      }
      if (current === "roaming" && progress >= 0.9) {
        setState("exitingLeft");
        setSpeechText(null);
        return;
      }
      if (current === "exitingLeft" && progress >= 0.95) {
        setState("goodbye");
        setSpeechText(GOODBYE_COPY);
        return;
      }

      // Reverse transitions
      if (current === "goodbye" && progress < 0.94) {
        // User scrolled up — depart left, loop back from right, restart
        setState("departingLeft");
        return;
      }
      if (current === "exitingLeft" && progress < 0.82) {
        setState("roaming");
        setSpeechText(null);
        return;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reducedMotion, clearTimers]);

  // Section IntersectionObserver — fires when section content is well in view
  useEffect(() => {
    if (reducedMotion) return;

    for (const [sectionId, copy] of Object.entries(SECTION_TRIGGERS)) {
      const el = document.getElementById(sectionId);
      if (!el) continue;

      const observerConfig = SECTION_OBSERVER_CONFIG[sectionId] ?? {
        threshold: 0.4,
        rootMargin: "0px 0px -10% 0px",
      };
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !firedSections.current.has(sectionId)) {
          firedSections.current.add(sectionId);
          observer.disconnect();

          setState("section-comment");
          setSpeechText(copy);

          const returnTimer = setTimeout(() => {
            setState("roaming");
            setSpeechText(null);
          }, 6000);

          timersRef.current.push(returnTimer);
        }
      }, observerConfig);
      observer.observe(el);
      observersRef.current.push(observer);
    }

    return () => {
      for (const obs of observersRef.current) obs.disconnect();
      observersRef.current = [];
    };
  }, [reducedMotion]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Chat-driven navigation — separate channel from scroll popups
  // biome-ignore lint/correctness/useExhaustiveDependencies: reducedMotion is stable (matchMedia init, never mutated)
  useEffect(() => {
    const handleChatNav = (e: Event) => {
      const { sectionId, orbyMessage } = (
        e as CustomEvent<{ sectionId: string; orbyMessage: string | null }>
      ).detail;

      // Reduced-motion path: skip state changes, show text after jump settles
      if (reducedMotion) {
        if (!orbyMessage) return;
        const t = setTimeout(() => {
          setSpeechText(orbyMessage);
          const clearT = setTimeout(() => setSpeechText(null), 7000);
          timersRef.current.push(clearT);
        }, 500);
        timersRef.current.push(t);
        return;
      }

      // Cancel any prior pending navigation
      const prior = chatNavPendingRef.current;
      if (prior) {
        prior.observer?.disconnect();
        if (prior.timeoutId !== null) clearTimeout(prior.timeoutId);
        prior.cancelListeners?.();
      }
      chatNavPendingRef.current = null;

      // Glide home
      setState("chat-nav-home");
      setSpeechText(null);

      let observer: IntersectionObserver | null = null;

      const removeCancelListeners = () => {
        window.removeEventListener("wheel", cancelNav);
        window.removeEventListener("touchmove", cancelNav);
      };

      const finishNav = () => {
        observer?.disconnect();
        const pending = chatNavPendingRef.current;
        if (pending?.timeoutId !== null && pending?.timeoutId !== undefined) {
          clearTimeout(pending.timeoutId);
        }
        removeCancelListeners();
        chatNavPendingRef.current = null;
      };

      const cancelNav = () => {
        finishNav();
        if (stateRef.current === "chat-nav-home") {
          setState("roaming");
        }
      };

      const targetEl = document.getElementById(sectionId);
      if (targetEl) {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              finishNav();
              if (orbyMessage) {
                setState("chat-nav-arrival");
                setSpeechText(orbyMessage);
                const clearT = setTimeout(() => {
                  setState("roaming");
                  setSpeechText(null);
                }, 7000);
                timersRef.current.push(clearT);
              } else {
                setState("roaming");
              }
            }
          },
          { threshold: 0.3 },
        );
        observer.observe(targetEl);
      }

      // Max-wait cap: if section doesn't enter view within 4s, cancel silently
      const timeoutId = setTimeout(cancelNav, 4000);

      window.addEventListener("wheel", cancelNav, { once: true });
      window.addEventListener("touchmove", cancelNav, { once: true });

      chatNavPendingRef.current = {
        observer,
        timeoutId,
        cancelListeners: removeCancelListeners,
      };
    };

    window.addEventListener("orby:navigate", handleChatNav);
    return () => {
      window.removeEventListener("orby:navigate", handleChatNav);
      const pending = chatNavPendingRef.current;
      if (pending) {
        pending.observer?.disconnect();
        if (pending.timeoutId !== null) clearTimeout(pending.timeoutId);
        pending.cancelListeners?.();
      }
    };
  }, []);

  return { state, speechText, showArrow };
}
