"use client";

/**
 * use-space-float.ts
 *
 * Gives any HTML element continuous, gentle, bounded zero-gravity drift.
 *
 * Motion model: sum of 3 low-frequency sines on translateX / translateY plus a
 * tiny rotation. Per-instance random phase offsets (chosen once on mount via
 * useRef so they never trigger re-renders) ensure no two elements drift in sync.
 *
 * Composition rule with CometCard:
 *   The consumer spreads `style` onto an OUTER wrapper div and places <CometCard>
 *   inside that wrapper. This means:
 *     - useSpaceFloat owns the outer "world-space drift" transform
 *     - CometCard owns the inner "tilt on hover" transform
 *   They never compete because they are on separate DOM layers.
 *
 *   Example:
 *     const { ref, style } = useSpaceFloat({ radius: 6 })
 *     <div ref={ref} style={style}>
 *       <CometCard>…</CometCard>
 *     </div>
 *
 * Performance notes:
 *   - Writes directly to ref.current.style.transform — zero React state updates
 *   - Uses the shared space-float-ticker (one rAF for the whole site)
 *   - prefers-reduced-motion is checked once at hook mount
 *   - No new objects created per frame
 */

import type React from "react";
import { useEffect, useRef } from "react";
import { addFloater, removeFloater } from "@/lib/space-float-ticker";

export interface UseSpaceFloatOptions {
  /** Half-amplitude of the drift in pixels (default 6) */
  radius?: number;
  /** Maximum rotation in degrees (default 0.6) */
  rotate?: number;
  /** Speed multiplier applied to all sine periods (default 1) */
  speed?: number;
  /** When true, returns a static identity transform (same effect as reduced-motion) */
  disabled?: boolean;
}

export interface UseSpaceFloatResult {
  ref: React.RefObject<HTMLElement | null>;
  style: React.CSSProperties;
}

// Sine periods in seconds (before the speed multiplier).
// Three independent oscillators per axis produce organic, non-repeating drift.
// Irrational-ish ratios mean patterns never fully repeat within a session.
const PERIODS_X = [7.3, 4.1, 9.7] as const; // seconds
const PERIODS_Y = [5.9, 8.2, 4.7] as const;
const PERIOD_R = 6.3; // for the rotation oscillator

export function useSpaceFloat(
  opts: UseSpaceFloatOptions = {},
): UseSpaceFloatResult {
  const { radius = 6, rotate = 0.6, speed = 1, disabled = false } = opts;

  // Store live option values in refs so the ticker callback always reads
  // the latest prop without being re-registered on every render.
  const radiusRef = useRef(radius);
  const rotateRef = useRef(rotate);
  const speedRef = useRef(speed);
  radiusRef.current = radius;
  rotateRef.current = rotate;
  speedRef.current = speed;

  const ref = useRef<HTMLElement | null>(null);

  // Per-instance random phases — assigned exactly once, never cause re-renders.
  const phases = useRef<{
    px: [number, number, number];
    py: [number, number, number];
    pr: number;
    id: string;
  } | null>(null);

  if (phases.current === null) {
    const rnd = () => Math.random() * Math.PI * 2;
    phases.current = {
      px: [rnd(), rnd(), rnd()],
      py: [rnd(), rnd(), rnd()],
      pr: rnd(),
      // Stable unique ID for this instance in the shared ticker
      id: `sf-${Math.random().toString(36).slice(2, 9)}`,
    };
  }

  // Determine whether to stay static at render time so the returned `style`
  // object is already correct before the effect runs. SSR returns {} safely.
  const isStatic =
    disabled ||
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (disabled || prefersReduced) {
      if (ref.current) ref.current.style.transform = "";
      return;
    }

    const { px, py, pr, id } = phases.current!;

    addFloater(id, (elapsed: number) => {
      const el = ref.current;
      if (!el) return;

      const t = elapsed * speedRef.current;
      // Each of the 3 oscillators contributes radius/3 so total peak = radius
      const amplitude = radiusRef.current / 3;

      const tx =
        Math.sin(((Math.PI * 2) / PERIODS_X[0]) * t + px[0]) * amplitude +
        Math.sin(((Math.PI * 2) / PERIODS_X[1]) * t + px[1]) * amplitude +
        Math.sin(((Math.PI * 2) / PERIODS_X[2]) * t + px[2]) * amplitude;

      const ty =
        Math.sin(((Math.PI * 2) / PERIODS_Y[0]) * t + py[0]) * amplitude +
        Math.sin(((Math.PI * 2) / PERIODS_Y[1]) * t + py[1]) * amplitude +
        Math.sin(((Math.PI * 2) / PERIODS_Y[2]) * t + py[2]) * amplitude;

      // Single slow oscillator for the rotation nudge
      const rz =
        Math.sin(((Math.PI * 2) / PERIOD_R) * t + pr) * rotateRef.current;

      // GPU-only composite transform — never mutates top/left/width/height
      el.style.transform = `translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px) rotate(${rz.toFixed(4)}deg)`;
    });

    return () => {
      const { id } = phases.current!;
      removeFloater(id);
      // Reset so element doesn't freeze mid-drift if the component unmounts
      if (ref.current) {
        ref.current.style.transform = "";
      }
    };
    // `disabled` is the only dep: the ticker callback reads all other values from
    // live refs, so re-registering on radius/rotate/speed changes is not needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return {
    ref,
    // `willChange: transform` tells the compositor to promote this layer.
    // Omit it when static so we don't promote elements that never animate.
    style: isStatic ? {} : { willChange: "transform" },
  };
}
