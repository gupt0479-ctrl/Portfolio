"use client";

/**
 * space-rail.tsx
 *
 * Shared vertical timeline rail used by ExperienceSection and AchievementsSection.
 *
 * Renders:
 *   - A single full-height gradient line (not segmented — one smooth gradient
 *     from top-transparent → violet peak → cyan mid → violet → transparent)
 *   - A scroll-progress fill overlay that travels down the rail as the user
 *     scrolls through the section. Implemented with Framer's useScroll +
 *     useSpring so the fill has a satisfying spring lag.
 *   - Dots at evenly-spaced positions aligned with each timeline item. Dots are
 *     on a separate layer so they don't move with the "breathing" wiggle.
 *   - Breathing: a slow sine (period ~8s) sets a CSS custom property
 *     --rail-breathe (-2px to 2px) on the rail line only, giving it a gentle
 *     horizontal sway without affecting dot positions or card alignment.
 *
 * Ownership model:
 *   SpaceRail renders only the track column. The consumer (ExperienceSection,
 *   AchievementsSection) still renders the card/row in a sibling flex column.
 *   Both consumer and rail sit inside the same flex row or CSS grid cell.
 *
 * rAF budget:
 *   The breathing sine uses a single useEffect rAF loop scoped to this component.
 *   It is separate from the space-float-ticker intentionally — the rail is a
 *   structural element, not a "floater", and its motion is on the CSS custom
 *   property layer rather than a direct style.transform write.
 */

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SpaceRailProps {
  /** Total number of timeline items — controls dot count and spacing */
  itemCount: number;
  className?: string;
  /** Tailwind width class for the outer column wrapper (default "w-6") */
  width?: string;
}

// Period of the breathing sine in seconds
const BREATHE_PERIOD = 8; // seconds
// Max horizontal sway in pixels
const BREATHE_AMPLITUDE = 2; // px

export function SpaceRail({
  itemCount,
  className,
  width = "w-6",
}: SpaceRailProps) {
  // Ref to the outer container — useScroll tracks it to drive fill progress
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref to the rail line div — the breathing transform is applied here
  const railLineRef = useRef<HTMLDivElement>(null);

  // Scroll-progress fill
  // useScroll target is the container div; `offset` maps its entry/exit to [0,1]
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  // Spring-smoothed progress so the fill lags slightly behind scroll (feels alive)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  // Map 0→1 progress to 0%→100% height for the fill overlay
  const fillHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Breathing: slow sine on translateX of the rail line only.
  // useEffect with its own rAF — deliberately not using the space-float-ticker
  // because the ticker passes elapsed-seconds, which would compete with the
  // component's own lifecycle (the rail may unmount mid-session). A local rAF
  // is cleaner here and only runs while the section is in the DOM.
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    let rafHandle: number;
    let startTime: number | null = null;

    const animate = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = (now - startTime) / 1000; // seconds

      const sway =
        Math.sin(((Math.PI * 2) / BREATHE_PERIOD) * elapsed) *
        BREATHE_AMPLITUDE;

      if (railLineRef.current) {
        // GPU-only transform — translateX only, no layout properties touched
        railLineRef.current.style.transform = `translateX(${sway.toFixed(3)}px)`;
      }

      rafHandle = requestAnimationFrame(animate);
    };

    rafHandle = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafHandle);
      if (railLineRef.current) {
        railLineRef.current.style.transform = "";
      }
    };
  }, []);

  // Build dot positions as percentage offsets along the rail height.
  // With itemCount items, dots sit at: 0%, 100%/(n-1), 200%/(n-1), …, 100%
  // For a single item the dot is centered at 50%.
  const dotPositions =
    itemCount <= 1
      ? [50]
      : Array.from(
          { length: itemCount },
          (_, i) => (i / (itemCount - 1)) * 100,
        );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center shrink-0",
        width,
        className,
      )}
      aria-hidden
    >
      {/* Rail line layer — this is what breathes (translateX sway) */}
      {/* willChange: transform is set inline to avoid adding a global CSS class */}
      <div
        ref={railLineRef}
        className="absolute inset-y-0 left-1/2 -translate-x-1/2"
        style={{ width: 1, willChange: "transform" }}
      >
        {/* Static gradient base — single smooth gradient, not segmented */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(167,139,250,0.6) 10%, rgba(103,232,249,0.4) 50%, rgba(167,139,250,0.6) 90%, transparent 100%)",
            boxShadow: "0 0 8px rgba(167,139,250,0.3)",
          }}
        />

        {/* Scroll-progress fill — sits on top of the gradient, same violet but brighter */}
        <motion.div
          className="absolute top-0 left-0 w-full"
          style={{
            height: fillHeight,
            background:
              "linear-gradient(to bottom, rgba(167,139,250,0.9) 0%, rgba(139,200,250,0.7) 50%, rgba(167,139,250,0.9) 100%)",
            boxShadow: "0 0 12px rgba(167,139,250,0.5)",
          }}
        />
      </div>

      {/* Dot layer — separate from the rail line so dots don't wiggle with the breathe sway */}
      <div className="absolute inset-0">
        {dotPositions.map((pct, idx) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static positions, no reordering
            key={idx}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ top: `${pct}%` }}
          >
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full -m-1.5"
              style={{
                background: "rgba(143,124,247,0.15)",
                width: 16,
                height: 16,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
            {/* Dot core */}
            <div
              className="relative rounded-full bg-violet-500"
              style={{
                width: 10,
                height: 10,
                boxShadow:
                  "0 0 0 3px rgba(143,124,247,0.2), 0 0 12px rgba(143,124,247,0.6), 0 0 4px rgba(143,124,247,0.9)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
