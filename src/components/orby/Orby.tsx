"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { OrbyArrow } from "./OrbyArrow";
import { OrbyCanvas } from "./OrbyCanvas";
import { OrbySpeechCloud } from "./OrbySpeechCloud";
import type { OrbyState } from "./useOrbyState";
import { useOrbyState } from "./useOrbyState";

function getScrollProgress(): number {
  if (typeof window === "undefined") return 0;
  const sh = document.documentElement.scrollHeight - window.innerHeight;
  return sh > 0 ? Math.min(Math.max(window.scrollY / sh, 0), 1) : 0;
}

function getPose(state: OrbyState): "idle" | "pointing" | "wave" {
  if (state === "pointing") return "pointing";
  if (state === "goodbye" || state === "departingLeft") return "wave";
  return "idle";
}

// Lab button: fixed bottom-6 right-6 (24px each), w-12 h-12 (48px).
// Center at (vw - 48, vh - 48). 8px gap to button left edge (vw - 72).
function computeHomeX(vw: number, size: number, sidebarOffset: number) {
  return vw - 72 - 20 - size - sidebarOffset;
}
function computeHomeY(vh: number, canvasH: number) {
  // Vertically center Orby with the lab button center
  return vh - canvasH / 2 - 48;
}
function computeBottomY(vh: number, canvasH: number) {
  // 24px clearance keeps Orby from visually clipping the viewport edge
  return vh - canvasH - 24;
}

// Ease-out cubic
function easeOut(t: number): number {
  return 1 - (1 - Math.min(t, 1)) ** 3;
}
// Ease-in cubic
function easeIn(t: number): number {
  return Math.min(t, 1) ** 3;
}

/**
 * Orby — autonomous floating astronaut companion.
 *
 * All position animation runs in a RAF loop that writes directly to DOM
 * transforms, decoupled from React re-renders. State machine events (speech,
 * state changes) trigger React renders; position does not.
 *
 * Hero behaviour: Orby starts glued to the bottom, then lifts off to hover
 *   height over ~3 s — a slow launch from the ground.
 * End behaviour: Orby drifts left across the page, lands to the bottom when
 *   reaching the left edge (goodbye state), says farewell, then on any upward
 *   scroll it departs left off-screen and re-enters from the right.
 */
export default function Orby() {
  const { open, isMobile, openMobile } = useSidebar();
  const sidebarOpen = isMobile ? openMobile : open;

  const { state, speechText, showArrow } = useOrbyState({
    sidebarOpen,
    isMobile,
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const sidebarRef = useRef(sidebarOpen);
  sidebarRef.current = sidebarOpen;
  const mobileRef = useRef(isMobile);
  mobileRef.current = isMobile;

  // Lazy-init from window: no 88→64 flash on mobile (this component is client-only)
  const [canvasSize, setCanvasSize] = useState(() =>
    typeof window !== "undefined" ? (window.innerWidth < 768 ? 64 : 88) : 88,
  );
  const canvasSizeRef = useRef(canvasSize);
  useEffect(() => {
    const update = () => {
      const s = window.innerWidth < 768 ? 64 : 88;
      setCanvasSize(s);
      canvasSizeRef.current = s;
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [tooSmall, setTooSmall] = useState(false);
  useEffect(() => {
    const check = () =>
      setTooSmall(window.innerHeight < 560 && window.innerWidth < 400);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0, rotation: 0 });
  const [arrowPos, setArrowPos] = useState({ x: 0, y: 0 });
  const [cloudAbove, setCloudAbove] = useState(true);
  const nudgeRef = useRef(0);

  const handleOrbyClick = useCallback(() => {
    nudgeRef.current -= 48;
  }, []);

  // Set initial transform synchronously before paint — Orby starts at the bottom
  useLayoutEffect(() => {
    const size = window.innerWidth < 768 ? 64 : 88;
    const canvasH = Math.round(size * 1.3);
    const x = computeHomeX(window.innerWidth, size, 0);
    const y = computeBottomY(window.innerHeight, canvasH);
    posRef.current = { x, y, rotation: 0 };
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, []);

  // Teleport to off-screen right when returningRight begins (bottom of screen)
  useEffect(() => {
    if (state === "returningRight") {
      const size = canvasSizeRef.current;
      const canvasH = Math.round(size * 1.3);
      posRef.current.x = window.innerWidth + size + 60;
      posRef.current.y = computeBottomY(window.innerHeight, canvasH);
    }
  }, [state]);

  // ─── Main RAF animation loop ─────────────────────────────────────────────────
  useEffect(() => {
    let rafId: number;
    let frame = 0;
    const startTime = performance.now();

    // Track when state last changed so we can do time-based transitions per state
    const prevStateRef = { current: stateRef.current };
    const stateStartTRef = { current: startTime };

    const animate = (now: number) => {
      const t = (now - startTime) * 0.001; // elapsed seconds since mount
      const currentState = stateRef.current;
      const mobile = mobileRef.current;
      const sidebar = sidebarRef.current;
      const size = canvasSizeRef.current;
      const canvasH = Math.round(size * 1.3);

      // Detect state changes to record when each state began
      if (prevStateRef.current !== currentState) {
        stateStartTRef.current = now;
        prevStateRef.current = currentState;
      }
      const stateElapsed = (now - stateStartTRef.current) * 0.001;

      const sidebarOffset = sidebar && !mobile ? 448 : 0;
      const rightX = computeHomeX(window.innerWidth, size, sidebarOffset);
      const rightY = computeHomeY(window.innerHeight, canvasH);
      const bottomY = computeBottomY(window.innerHeight, canvasH);
      const leftX = mobile ? 16 : 32;

      if (currentState === "reducedMotion") {
        if (wrapperRef.current) {
          wrapperRef.current.style.transform = `translate(${rightX}px, ${rightY}px)`;
        }
        if (cloudRef.current) cloudRef.current.style.transform = "";
        rafId = requestAnimationFrame(animate);
        return;
      }

      let targetX: number;
      let targetY: number;
      let orbitRx: number;
      let orbitRy: number;
      let orbitSpd: number;
      let followK: number;

      switch (currentState) {
        case "intro": {
          // Lift off from bottom over first 3 s — slow space launch
          const liftProgress = easeOut(t / 3.0);
          targetX = rightX;
          targetY = bottomY + (rightY - bottomY) * liftProgress;
          orbitRx = 6;
          orbitRy = 4;
          orbitSpd = 0.55;
          followK = 0.065;
          break;
        }

        case "pointing": {
          // Hover at home position — liftoff already done in intro
          targetX = rightX;
          targetY = rightY;
          orbitRx = 6;
          orbitRy = 4;
          orbitSpd = 0.55;
          followK = 0.065;
          break;
        }

        case "roaming": {
          const progress = getScrollProgress();
          const sc = Math.min(Math.max((progress - 0.1) / 0.8, 0), 1);
          targetX = rightX + (leftX - rightX) * sc;
          targetY = rightY;
          orbitRx = mobile ? 12 : 22;
          orbitRy = mobile ? 8 : 14;
          orbitSpd = 0.38;
          followK = 0.065;
          break;
        }

        case "section-comment":
          targetX = posRef.current.x;
          targetY = posRef.current.y;
          orbitRx = 4;
          orbitRy = 3;
          orbitSpd = 0.3;
          followK = 0.025;
          break;

        case "exitingLeft":
          // Park at left edge with micro-float while waiting for goodbye trigger
          targetX = leftX;
          targetY = rightY;
          orbitRx = mobile ? 4 : 6;
          orbitRy = mobile ? 3 : 4;
          orbitSpd = 0.3;
          followK = 0.08;
          break;

        case "goodbye": {
          // Land gently to bottom over 1.5 s, then stay grounded — waving goodbye
          const landProgress = easeIn(stateElapsed / 1.5);
          targetX = leftX;
          targetY = rightY + (bottomY - rightY) * landProgress;
          // Orbit fades as landing settles
          const orbitFade = 1 - landProgress;
          orbitRx = 10 * orbitFade;
          orbitRy = 6 * orbitFade;
          orbitSpd = 0.7;
          followK = 0.065;
          break;
        }

        case "departingLeft":
          // Slide off-screen left from bottom — timer in useOrbyState handles next state
          targetX = -size - 80;
          targetY = bottomY;
          orbitRx = 0;
          orbitRy = 0;
          orbitSpd = 0;
          followK = 0.15;
          break;

        case "returningRight":
          // Spring in from off-screen right (teleported on state entry) to home position
          targetX = rightX;
          targetY = rightY;
          orbitRx = 0;
          orbitRy = 0;
          orbitSpd = 0;
          followK = 0.08;
          break;

        case "chat-nav-home":
          // Glide back to home — signals intentional navigation is underway
          targetX = rightX;
          targetY = rightY;
          orbitRx = 4;
          orbitRy = 3;
          orbitSpd = 0.4;
          followK = 0.12;
          break;

        case "chat-nav-arrival":
          // Hold at home while showing the per-request arrival message
          targetX = rightX;
          targetY = rightY;
          orbitRx = 4;
          orbitRy = 3;
          orbitSpd = 0.4;
          followK = 0.065;
          break;

        default:
          targetX = rightX;
          targetY = rightY;
          orbitRx = 6;
          orbitRy = 4;
          orbitSpd = 0.5;
          followK = 0.065;
      }

      const orbitX =
        Math.sin(t * orbitSpd) * orbitRx +
        Math.sin(t * orbitSpd * 1.73) * orbitRx * 0.28;
      const orbitY =
        Math.cos(t * orbitSpd * 0.81) * orbitRy +
        Math.cos(t * orbitSpd * 1.47) * orbitRy * 0.35;

      nudgeRef.current *= 0.94;
      const desiredX = targetX + orbitX + nudgeRef.current;
      const desiredY = targetY + orbitY;

      const { x: cx, y: cy } = posRef.current;
      const newX = cx + (desiredX - cx) * followK;
      const newY = cy + (desiredY - cy) * followK;

      // Body tumble — kept very small (max ~3°) so the CSS-rotated canvas
      // doesn't project-width-change visibly, which reads as size glitching.
      const rotation =
        Math.sin(t * 0.71) * 1.8 +
        Math.sin(t * 1.37) * 0.8 +
        Math.sin(t * 0.43 + 1.2) * 0.6;

      posRef.current = { x: newX, y: newY, rotation };

      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate(${newX}px, ${newY}px) rotate(${rotation}deg)`;
      }
      if (cloudRef.current) {
        cloudRef.current.style.transform = `rotate(${-rotation}deg)`;
      }

      // Arrow pos: in pointing state, emit from the extended right hand position
      // rather than Orby's center. The hand is at ~80% width, ~50% height in the canvas.
      frame++;
      if (frame % 8 === 0) {
        const isPointing = currentState === "pointing";
        setArrowPos({
          x: Math.round(newX + (isPointing ? size * 0.82 : size / 2)),
          y: Math.round(newY + (isPointing ? canvasH * 0.52 : canvasH / 2)),
        });
        // Cloud renders above Orby unless Orby is very near the top of the screen
        setCloudAbove(newY > 90);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (tooSmall) return null;

  const cloudVisible = speechText !== null && !sidebarOpen;
  const pose = getPose(state);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: aria-hidden decorative companion — AT never reaches this element */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: aria-hidden decorative companion — AT never reaches this element */}
      <div
        ref={wrapperRef}
        className="absolute pointer-events-auto cursor-pointer"
        style={{ willChange: "transform" }}
        onClick={handleOrbyClick}
      >
        <OrbyCanvas pose={pose} speaking={cloudVisible} size={canvasSize} />
        <div
          ref={cloudRef}
          className="pointer-events-none absolute inset-0"
          style={{ transformOrigin: "center center" }}
        >
          <OrbySpeechCloud
            text={speechText}
            visible={cloudVisible}
            positionAbove={cloudAbove}
          />
        </div>
      </div>

      <div
        className="absolute"
        style={{ transform: `translate(${arrowPos.x}px, ${arrowPos.y}px)` }}
      >
        <OrbyArrow orbyPosition={arrowPos} visible={showArrow} />
      </div>
    </div>
  );
}
