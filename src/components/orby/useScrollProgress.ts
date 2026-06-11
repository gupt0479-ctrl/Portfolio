import { useEffect, useState } from "react";

/**
 * Clamps a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates between start and end by factor t (0–1).
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Returns scroll progress as a number between 0 (top) and 1 (bottom).
 * Uses a single requestAnimationFrame loop — no scroll event listener.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number;

    const update = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const raw = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setProgress(clamp(raw, 0, 1));
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return progress;
}
