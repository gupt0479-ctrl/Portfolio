"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns true if the user prefers reduced motion.
 * SSR-safe — returns false when window is not available.
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Types a string char-by-char at a given speed.
 * Returns the full text immediately when reduced motion is active.
 *
 * @param text - The full string to type out
 * @param speed - Characters per second (default 30)
 * @param enabled - Whether typing should begin (default true)
 */
export function useTypedText(
  text: string,
  speed = 30,
  enabled = true,
): { displayText: string; isComplete: boolean } {
  const [charIndex, setCharIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotion = useRef(prefersReducedMotion());
  const prevTextRef = useRef(text);

  // Reset index when text changes (synchronous check during render)
  if (prevTextRef.current !== text) {
    prevTextRef.current = text;
    setCharIndex(0);
  }

  // Run the typing interval
  useEffect(() => {
    // Reduced motion — show full text immediately
    if (reducedMotion.current) {
      setCharIndex(text.length);
      return;
    }

    // Not enabled or already complete — do nothing
    if (!enabled || charIndex >= text.length) {
      return;
    }

    const ms = 1000 / speed;

    intervalRef.current = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= text.length) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return prev;
        }
        return prev + 1;
      });
    }, ms);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed, enabled, charIndex]);

  const isComplete = charIndex >= text.length;
  const displayText = text.slice(0, charIndex);

  return { displayText, isComplete };
}
