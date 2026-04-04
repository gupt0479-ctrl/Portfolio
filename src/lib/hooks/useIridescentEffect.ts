"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

type UseIridescentEffectOptions = {
  /** Peak alpha in the radial gradient (overall strength). Default 0.15 */
  gradientAlpha?: number;
};

/**
 * Pointer-tracking iridescent shimmer: hue shifts on each pointermove.
 * Attach `ref` to the hover target; render overlay with `overlayStyle`.
 */
export function useIridescentEffect(
  options: UseIridescentEffectOptions = {},
): {
  ref: RefObject<HTMLDivElement | null>;
  overlayStyle: CSSProperties;
} {
  const { gradientAlpha = 0.15 } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const hueRef = useRef(0);
  const [overlayStyle, setOverlayStyle] = useState<CSSProperties>({
    background: "transparent",
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const xPct = (e.clientX - r.left) / Math.max(r.width, 1);
      const yPct = (e.clientY - r.top) / Math.max(r.height, 1);
      hueRef.current = (hueRef.current + 1) % 360;
      const h = hueRef.current;
      setOverlayStyle({
        background: `radial-gradient(circle 140px at ${xPct * 100}% ${yPct * 100}%, hsla(${h}deg, 80%, 70%, ${gradientAlpha}), transparent 70%)`,
      });
    };

    const onLeave = () => {
      setOverlayStyle({ background: "transparent" });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gradientAlpha]);

  return { ref, overlayStyle };
}
