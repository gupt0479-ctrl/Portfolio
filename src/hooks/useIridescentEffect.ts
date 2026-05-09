"use client";

import { type RefObject, useEffect, useRef } from "react";

type UseIridescentEffectOptions = {
  /** Peak alpha in the radial gradient (overall strength). Default 0.15 */
  gradientAlpha?: number;
};

/**
 * Pointer-tracking iridescent shimmer: hue shifts on each pointermove.
 * Attach `ref` to the hover target; render overlay from `--irid-bg`.
 */
export function useIridescentEffect(options: UseIridescentEffectOptions = {}): {
  ref: RefObject<HTMLDivElement | null>;
} {
  const { gradientAlpha = 0.15 } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const hueRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.setProperty("--irid-bg", "transparent");

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const xPct = (e.clientX - r.left) / Math.max(r.width, 1);
      const yPct = (e.clientY - r.top) / Math.max(r.height, 1);
      hueRef.current = (hueRef.current + 1) % 360;
      const h = hueRef.current;
      el.style.setProperty(
        "--irid-bg",
        `radial-gradient(circle 140px at ${xPct * 100}% ${yPct * 100}%, hsla(${h}deg, 80%, 70%, ${gradientAlpha}), transparent 70%)`,
      );
    };

    const onLeave = () => {
      el.style.setProperty("--irid-bg", "transparent");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gradientAlpha]);

  return { ref };
}
