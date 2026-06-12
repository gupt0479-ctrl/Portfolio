"use client";

import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
} from "@react-three/postprocessing";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";

// TUNING CONSTANTS  — one place to adjust feel

// --- Counts --- Planet and ring counts are halved on mobile for performance
const PLANET_COUNT_DESKTOP = 2800;
const PLANET_COUNT_MOBILE = 1400;
const RING_COUNT_DESKTOP = 2000; // real count = floor(N/16)*16
const RING_COUNT_MOBILE = 1000;
const STAR_COUNT_DESKTOP = 5500;
const STAR_COUNT_MOBILE = 2750;

// --- Geometry ---
const PLANET_RADIUS = 0.8;
const RING_MAJOR_RADIUS = 2.6;
const RING_MINOR_RADIUS = 0.5;

// --- Planet edges ---
const PLANET_LINK_RADIUS = 0.3;
const MAX_EDGES_PER_POINT = 3;
// Line max-distance grows with scroll so deformed lines remain visible
const MAX_LINE_DIST_BASE = 0.4;
const MAX_LINE_DIST_END = 0.65; // moderate — lines visible during dent but not wild

// --- Magnetic pull / dent ---
// All values interpolate from START (top of page) to END (bottom of page)
// via `stretchT` which is 0 in the top 40% and ramps 0→1 over the bottom 60%.
const PULL_STR_START = 0.018; // gentle hint on hero section
const PULL_STR_END = 0.095; // moderate pull at full scroll — clearly visible dent
const PULL_RADIUS_START = 1.8; // world-space radius of influence at top
const PULL_RADIUS_END = 2.5; // wider at bottom so more of sphere responds
const MAX_DISPLACE_START = 0.1; // max dot displacement at top (~sphere stays clean)
const MAX_DISPLACE_END = 0.32; // moderate dent at bottom — reads as sphere still

// Ring hover (always gentle, just atmospheric)
const ATTRACT_STR_RING = 0.028;

// Click burst
const BURST_STRENGTH = 0.22;
const BURST_DURATION = 2.0;
const BURST_SHELL_MAX = PLANET_RADIUS * 1.15;

// Spring / damping
// Softer spring + higher damping at scroll-end = dots linger before returning
const SPRING_K_START = 0.1;
const SPRING_K_END = 0.052;
const DAMPING_START = 0.9;
const DAMPING_END = 0.935;
const BASE_DRIFT = 0.004;

// Reduced motion values — used when user prefers reduced motion
const REDUCED_PULL_STR = 0.004;
const REDUCED_MAX_DISPLACE = 0.05;
const REDUCED_DRIFT = 0.001;

// Camera scroll start → end
const CAM_START: [number, number, number] = [3.5, 2.8, 5.2];
// End z is kept comfortably back so planet never overwhelms viewport
const CAM_END: [number, number, number] = [0.4, 0.2, 3.2];

// --- Star narrative ---
// Stars lead at page load → dim as sphere earns attention → settle
const STAR_OP_TOP = 0.5;
const STAR_OP_MID = 0.26;
const STAR_OP_BOT = 0.3;

// --- Line opacities ---
const PLINE_OP_LOW = 0.045;
const PLINE_OP_HIGH = 0.12;
const RLINE_OP_LOW = 0.02;
const RLINE_OP_HIGH = 0.052;

// --- Colors ---
const COL_PLANET = "#9D8BBF";
const COL_RING = "#8A7AAE";
const COL_PLINE = "#8A7AAE";
const COL_RLINE = "#8A7AAE";
const COL_STAR = "#D0CBE8";

// --- Sidebar ---
const SIDEBAR_EASE = "0.38s cubic-bezier(0.4,0,0.2,1)";

// ═══════════════════════════════════════════════════════════════════════════════

// Detect reduced motion preference for accessibility
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reduced;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function createPointSprite(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, 64, 64);
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.7)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  return tex;
}

function fibonacciSphere(N: number, radius: number): number[][] {
  const pts: number[][] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = ((i / (N - 1)) * 2 - 1) * radius;
    const r = Math.sqrt(Math.max(0, radius * radius - y * y));
    const th = ga * i;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const n = (Math.sin(th * 3) * 0.02 + Math.cos(th * 5) * 0.015) * radius;
    pts.push([x + n * 0.3, y, z + n * 0.3]);
  }
  return pts;
}

function createRing(
  major: number,
  minor: number,
  nMajor: number,
  nMinor: number,
  tiltX: number,
  tiltZ: number,
): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < nMajor; i++) {
    const th = (i / nMajor) * Math.PI * 2;
    for (let j = 0; j < nMinor; j++) {
      const ph = (j / nMinor) * Math.PI * 2;
      const x = (major + minor * Math.cos(ph)) * Math.cos(th);
      const y = minor * Math.sin(ph);
      const z = (major + minor * Math.cos(ph)) * Math.sin(th);
      let y2 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
      const z2 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
      const x2 = x * Math.cos(tiltZ) - y2 * Math.sin(tiltZ);
      y2 = x * Math.sin(tiltZ) + y2 * Math.cos(tiltZ);
      pts.push([x2, y2, z2]);
    }
  }
  return pts;
}

function createStars(N: number, vol = 30): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < N; i++) {
    pts.push([
      (Math.random() - 0.5) * vol,
      (Math.random() - 0.5) * vol,
      (Math.random() - 0.5) * vol - 10,
    ]);
  }
  return pts;
}

// ─── Graph scene ─────────────────────────────────────────────────────────────

type GraphProps = {
  planetCount: number;
  ringCount: number;
  starCount: number;
  skipEffects: boolean;
};

function Graph({ planetCount, ringCount, starCount, skipEffects }: GraphProps) {
  const planetPointsRef = useRef<THREE.Points>(null);
  const ringPointsRef = useRef<THREE.Points>(null);
  const starPointsRef = useRef<THREE.Points>(null);
  const planetLinesRef = useRef<THREE.LineSegments>(null);
  const ringLinesRef = useRef<THREE.LineSegments>(null);
  const iMeshRef = useRef<THREE.Mesh>(null);

  const pointerWorld = useRef(new THREE.Vector3(0, 0, -10));
  const pointerActive = useRef(false);
  const releaseTimer = useRef(0);
  const scroll01 = useRef(0);
  const smoothScroll = useRef(0); // lagged scroll for smooth physics
  const burstTimer = useRef(-1);
  const burstActive = useRef(false);
  const reducedMotion = useReducedMotion();

  const { camera } = useThree();
  const pointTex = useMemo(() => createPointSprite(), []);

  // ── Precompute all per-point constants (runs once) ────────────────────────
  const data = useMemo(() => {
    // Planet
    const pPts = fibonacciSphere(planetCount, PLANET_RADIUS);
    const pPos0 = new Float32Array(planetCount * 3);
    const pPos = new Float32Array(planetCount * 3);
    const pVel = new Float32Array(planetCount * 3);
    const pNorm = new Float32Array(planetCount * 3);
    const pPhase = new Float32Array(planetCount);

    for (let i = 0; i < planetCount; i++) {
      const i3 = i * 3;
      pPos0[i3] = pPos[i3] = pPts[i][0];
      pPos0[i3 + 1] = pPos[i3 + 1] = pPts[i][1];
      pPos0[i3 + 2] = pPos[i3 + 2] = pPts[i][2];
      const len =
        Math.sqrt(pPts[i][0] ** 2 + pPts[i][1] ** 2 + pPts[i][2] ** 2) || 1;
      pNorm[i3] = pPts[i][0] / len;
      pNorm[i3 + 1] = pPts[i][1] / len;
      pNorm[i3 + 2] = pPts[i][2] / len;
      pPhase[i] = (i / planetCount) * Math.PI * 2;
    }

    // Planet edges
    const pLinks: number[] = [];
    for (let i = 0; i < planetCount; i++) {
      const i3 = i * 3;
      const ix = pPos0[i3];
      const iy = pPos0[i3 + 1];
      const iz = pPos0[i3 + 2];
      let taken = 0;
      for (let j = i + 1; j < planetCount && taken < MAX_EDGES_PER_POINT; j++) {
        const j3 = j * 3;
        const dx = ix - pPos0[j3];
        const dy = iy - pPos0[j3 + 1];
        const dz = iz - pPos0[j3 + 2];
        if (
          dx * dx + dy * dy + dz * dz <=
          PLANET_LINK_RADIUS * PLANET_LINK_RADIUS
        ) {
          pLinks.push(i, j);
          taken++;
        }
      }
    }

    // Ring
    const nMajor = Math.floor(ringCount / 16);
    const nMinor = 16;
    const rPts = createRing(
      RING_MAJOR_RADIUS,
      RING_MINOR_RADIUS,
      nMajor,
      nMinor,
      Math.PI * 0.3,
      Math.PI * 0.12,
    );
    const rc = Math.min(ringCount, rPts.length);
    const rPos0 = new Float32Array(rc * 3);
    const rPos = new Float32Array(rc * 3);
    const rVel = new Float32Array(rc * 3);
    const rAngle = new Float32Array(rc);

    for (let i = 0; i < rc; i++) {
      const i3 = i * 3;
      rPos0[i3] = rPos[i3] = rPts[i][0];
      rPos0[i3 + 1] = rPos[i3 + 1] = rPts[i][1];
      rPos0[i3 + 2] = rPos[i3 + 2] = rPts[i][2];
      rAngle[i] = Math.atan2(rPts[i][2], rPts[i][0]);
    }

    // Ring edges — inner/outer loops + sparse spokes
    const rLinks: number[] = [];
    for (let i = 0; i < nMajor; i++) {
      const next = (i + 1) % nMajor;
      rLinks.push(i * nMinor, next * nMinor);
      rLinks.push(i * nMinor + nMinor - 1, next * nMinor + nMinor - 1);
    }
    for (let i = 0; i < nMajor; i += 16) {
      rLinks.push(i * nMinor, i * nMinor + nMinor - 1);
    }

    // Stars
    const sPts = createStars(starCount);
    const sPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      sPos[i * 3] = sPts[i][0];
      sPos[i * 3 + 1] = sPts[i][1];
      sPos[i * 3 + 2] = sPts[i][2];
    }

    return {
      pPos0,
      pPos,
      pVel,
      pNorm,
      pPhase,
      rPos0,
      rPos,
      rVel,
      rAngle,
      rc,
      sPos,
      pEdges: new Uint32Array(pLinks),
      rEdges: new Uint32Array(rLinks),
    };
  }, [planetCount, ringCount, starCount]);

  // ── Geometries ────────────────────────────────────────────────────────────
  const planetGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.pPos, 3));
    return g;
  }, [data.pPos]);

  const ringGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.rPos, 3));
    return g;
  }, [data.rPos]);

  const starsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.sPos, 3));
    return g;
  }, [data.sPos]);

  const pLinesGeo = useMemo(() => {
    const lp = new Float32Array((data.pEdges.length / 2) * 6);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(lp, 3));
    return g;
  }, [data.pEdges]);

  const rLinesGeo = useMemo(() => {
    const lp = new Float32Array((data.rEdges.length / 2) * 6);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(lp, 3));
    return g;
  }, [data.rEdges]);

  // ── Events ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerActive.current = true;
      releaseTimer.current = 0;
      const v = new THREE.Vector3(nx, ny, 0.5).unproject(camera);
      const d = v.sub(camera.position).normalize();
      pointerWorld.current.copy(camera.position).addScaledVector(d, 5);
    };
    const onLeave = () => {
      pointerActive.current = false;
      releaseTimer.current = 0.7;
    };
    const onScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      scroll01.current = clamp01(window.scrollY / max);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [camera]);

  // Sphere mesh click only — stopPropagation keeps UI buttons working
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    burstActive.current = true;
    burstTimer.current = 0;
  };

  // ── useFrame — zero allocations per frame ────────────────────────────────
  useFrame((state) => {
    if (document.hidden) return;

    const t = state.clock.getElapsedTime();
    const dt = Math.min(state.clock.getDelta(), 0.05);

    // Smooth scroll lag — prevents physics spikes on rapid scrolling
    smoothScroll.current = lerpN(smoothScroll.current, scroll01.current, 0.055);
    const s = smoothScroll.current;

    // Ease for camera
    const easeS = s < 0.5 ? 2 * s * s : -1 + (4 - 2 * s) * s;

    // stretchT: 0 in top 40% of page, ramps 0→1 over bottom 60%
    // This is the master driver for all scroll-progressive effects.
    const stretchT = clamp01((s - 0.4) / 0.6);

    // Pointer release decay
    if (!pointerActive.current && releaseTimer.current > 0) {
      releaseTimer.current = Math.max(0, releaseTimer.current - dt);
    }
    const relF = pointerActive.current
      ? 1.0
      : clamp01(releaseTimer.current / 0.7);

    // Burst
    let burstP = 0;
    if (burstActive.current) {
      burstTimer.current =
        (burstTimer.current < 0 ? 0 : burstTimer.current) + dt;
      burstP = Math.min(1, burstTimer.current / BURST_DURATION);
      if (burstP >= 1) {
        burstActive.current = false;
        burstTimer.current = -1;
        burstP = 0;
      }
    }

    // Camera
    camera.position.x = lerpN(CAM_START[0], CAM_END[0], easeS);
    camera.position.y = lerpN(CAM_START[1], CAM_END[1], easeS);
    camera.position.z = lerpN(CAM_START[2], CAM_END[2], easeS);
    camera.lookAt(0, 0, 0);

    // ── Scroll-progressive physics ─────────────────────────────────────────
    // Adjust values for reduced motion users
    const pullStrBase = lerpN(PULL_STR_START, PULL_STR_END, stretchT);
    const pullStr = reducedMotion ? REDUCED_PULL_STR : pullStrBase;

    const pullRadius = lerpN(PULL_RADIUS_START, PULL_RADIUS_END, stretchT);
    const maxDispBase = lerpN(MAX_DISPLACE_START, MAX_DISPLACE_END, stretchT);
    const maxDisp = reducedMotion ? REDUCED_MAX_DISPLACE : maxDispBase;

    const springK = lerpN(SPRING_K_START, SPRING_K_END, stretchT);
    const dampingBase = lerpN(DAMPING_START, DAMPING_END, stretchT);
    const damping = reducedMotion ? 0.98 : dampingBase; // Higher damping = faster settling
    const maxLineDist = lerpN(MAX_LINE_DIST_BASE, MAX_LINE_DIST_END, stretchT);

    // Burst grows stronger the deeper into the page we are
    const burstScale = 1.0 + stretchT * 1.2;

    // Line opacity (fades slightly mid-burst so deformation reads clearly)
    const burstFade = burstActive.current
      ? 1 - Math.sin(clamp01(burstP) * Math.PI) * 0.45
      : 1;

    if (planetLinesRef.current) {
      (planetLinesRef.current.material as THREE.LineBasicMaterial).opacity =
        lerpN(PLINE_OP_LOW, PLINE_OP_HIGH, easeS) * burstFade;
    }
    if (ringLinesRef.current) {
      (ringLinesRef.current.material as THREE.LineBasicMaterial).opacity =
        lerpN(RLINE_OP_LOW, RLINE_OP_HIGH, easeS) * burstFade;
    }

    // ── Star narrative ─────────────────────────────────────────────────────
    // Bright on load ("oh, stars!") → dims mid-scroll as sphere becomes
    // the hero → settles so they don't disappear completely
    if (starPointsRef.current) {
      const mat = starPointsRef.current.material as THREE.PointsMaterial;
      const twinkle = Math.sin(t * 0.65) * 0.022;
      const starBase =
        s < 0.5
          ? lerpN(STAR_OP_TOP, STAR_OP_MID, s * 2)
          : lerpN(STAR_OP_MID, STAR_OP_BOT, (s - 0.5) * 2);
      mat.opacity = Math.max(0.1, starBase + twinkle + relF * 0.035);
    }

    // Planet brightens as it becomes the focal element
    if (planetPointsRef.current) {
      const mat = planetPointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = lerpN(0.32, 0.55, stretchT);
      // Slow hue drift: violet (#9D8BBF) ↔ cyan (#8BBFC0) over ~60s half-period
      if (!skipEffects) {
        mat.color.setHSL(0.615 + Math.sin(t * 0.03) * 0.115, 0.31, 0.65);
      }
    }

    // Effective pointer world (gracefully fades when cursor leaves)
    const pw = pointerWorld.current;
    const px = pw.x * relF;
    const py = pw.y * relF;
    const pz = pointerActive.current ? pw.z : lerpN(pw.z, -12, 1 - relF);

    const driftBase = BASE_DRIFT * (1 + easeS * 0.28);
    const drift = reducedMotion ? REDUCED_DRIFT * (1 + easeS * 0.1) : driftBase;
    const ar2 = pullRadius * pullRadius;
    const md2 = maxDisp * maxDisp;
    const mld2 = maxLineDist * maxLineDist;
    const shell2 = BURST_SHELL_MAX * BURST_SHELL_MAX;

    const {
      pPos0,
      pPos,
      pVel,
      pNorm,
      pPhase,
      pEdges,
      rPos0,
      rPos,
      rVel,
      rAngle,
      rc,
      rEdges,
    } = data;

    // ── Planet physics loop ───────────────────────────────────────────────
    for (let i = 0; i < planetCount; i++) {
      const i3 = i * 3;
      const x0 = pPos0[i3];
      const y0 = pPos0[i3 + 1];
      const z0 = pPos0[i3 + 2];
      let x = pPos[i3];
      let y = pPos[i3 + 1];
      let z = pPos[i3 + 2];
      let vx = pVel[i3];
      let vy = pVel[i3 + 1];
      let vz = pVel[i3 + 2];

      const nx = pNorm[i3];
      const ny = pNorm[i3 + 1];
      const nz = pNorm[i3 + 2];

      // Organic slow drift
      vx += Math.sin(t * 0.38 + x0 * 3.1) * drift;
      vy += Math.cos(t * 0.32 + y0 * 2.9) * drift;

      // ── Magnetic pull / dent ────────────────────────────────────────────
      //
      // Model: pull each dot directly toward the cursor ("magnetic").
      // This dents the sphere surface inward where the cursor is.
      //
      // Key design decisions to keep it satisfying:
      //  1. Force is toward cursor position — creates the magnetic dent feel.
      //  2. Only facing-side dots get strong pull (dot product gating).
      //     Dots facing away get a tiny secondary wobble — feels alive.
      //  3. Displacement is clamped from REST POSITION (not from origin),
      //     so the sphere can dent but can never collapse its core.
      //  4. No force component pointing inward toward sphere center →
      //     prevents that "sucked into middle" look.
      //
      if (relF > 0.01) {
        const dx = px - x;
        const dy = py - y;
        const dz = pz - z;
        const d2 = dx * dx + dy * dy + dz * dz;

        if (d2 < ar2) {
          const falloff = 1 - d2 / ar2;
          const str = pullStr * falloff * relF;

          // Which side of sphere is this dot on relative to cursor direction?
          // Positive = facing cursor, negative = facing away
          const dpx = px - x0; // cursor relative to REST position
          const dpy = py - y0;
          const dpz = pz - z0;
          const dLen = Math.sqrt(dpx * dpx + dpy * dpy + dpz * dpz) + 0.001;
          const facing = (dpx * nx + dpy * ny + dpz * nz) / dLen;

          if (facing > 0) {
            // Facing the cursor → full magnetic pull toward it
            vx += dx * str;
            vy += dy * str;
            vz += dz * str;
          } else {
            // Facing away → very subtle sympathetic wobble (not attracted)
            // This makes the back of sphere "breathe" slightly — alive feel
            vx += nx * str * 0.06 * -facing;
            vy += ny * str * 0.06 * -facing;
            vz += nz * str * 0.06 * -facing;
          }
        }
      }

      // ── Click burst — radial ripple wave ──────────────────────────────
      if (burstActive.current && burstP > 0) {
        const wave = Math.sin(pPhase[i] - burstP * Math.PI * 5) * (1 - burstP);
        const bStr = BURST_STRENGTH * burstScale * wave;
        vx += nx * bStr;
        vy += ny * bStr;
        vz += nz * bStr;
      }

      // Spring back — softer at high scroll for satisfying linger
      vx += (x0 - x) * springK;
      vy += (y0 - y) * springK;
      vz += (z0 - z) * springK;

      vx *= damping;
      vy *= damping;
      vz *= damping;
      x += vx;
      y += vy;
      z += vz;

      // ── Displacement clamp from REST position ──────────────────────────
      // Clamping from x0 (surface rest), not from origin:
      //  → Sphere shape is preserved (each dot stays near its lat/lon)
      //  → Dent depth is bounded: dot can only travel maxDisp from surface
      //  → Core never collapses because each dot's constraint is independent
      const ddx = x - x0;
      const ddy = y - y0;
      const ddz = z - z0;
      const disp2 = ddx * ddx + ddy * ddy + ddz * ddz;
      if (disp2 > md2) {
        const sc = maxDisp / Math.sqrt(disp2);
        x = x0 + ddx * sc;
        y = y0 + ddy * sc;
        z = z0 + ddz * sc;
        vx *= 0.45;
        vy *= 0.45;
        vz *= 0.45;
      }

      // ── Burst shell clamp ─────────────────────────────────────────────
      if (burstActive.current) {
        const r2 = x * x + y * y + z * z;
        if (r2 > shell2) {
          const sc = BURST_SHELL_MAX / Math.sqrt(r2);
          x *= sc;
          y *= sc;
          z *= sc;
        }
      }

      pPos[i3] = x;
      pPos[i3 + 1] = y;
      pPos[i3 + 2] = z;
      pVel[i3] = vx;
      pVel[i3 + 1] = vy;
      pVel[i3 + 2] = vz;
    }

    (planetGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate =
      true;

    // ── Planet lines ──────────────────────────────────────────────────────
    const plAttr = pLinesGeo.getAttribute("position") as THREE.BufferAttribute;
    const plPos = plAttr.array as Float32Array;
    for (let e = 0; e < pEdges.length; e += 2) {
      const a = pEdges[e];
      const b = pEdges[e + 1];
      const a3 = a * 3;
      const b3 = b * 3;
      const v = (e >> 1) * 6;
      const ax = pPos[a3];
      const ay = pPos[a3 + 1];
      const az = pPos[a3 + 2];
      const bx = pPos[b3];
      const by = pPos[b3 + 1];
      const bz = pPos[b3 + 2];
      const ddx = ax - bx;
      const ddy = ay - by;
      const ddz = az - bz;
      if (ddx * ddx + ddy * ddy + ddz * ddz > mld2) {
        // Degenerate segment — too stretched, write as zero-length (invisible)
        plPos[v] = ax;
        plPos[v + 1] = ay;
        plPos[v + 2] = az;
        plPos[v + 3] = ax;
        plPos[v + 4] = ay;
        plPos[v + 5] = az;
      } else {
        plPos[v] = ax;
        plPos[v + 1] = ay;
        plPos[v + 2] = az;
        plPos[v + 3] = bx;
        plPos[v + 4] = by;
        plPos[v + 5] = bz;
      }
    }
    plAttr.needsUpdate = true;

    // ── Ring physics ──────────────────────────────────────────────────────
    for (let i = 0; i < rc; i++) {
      const i3 = i * 3;
      const x0 = rPos0[i3];
      const y0 = rPos0[i3 + 1];
      const z0 = rPos0[i3 + 2];
      let x = rPos[i3];
      let y = rPos[i3 + 1];
      let z = rPos[i3 + 2];
      let vx = rVel[i3];
      let vy = rVel[i3 + 1];
      let vz = rVel[i3 + 2];

      const angle = rAngle[i] + t * 0.07;
      const orb = Math.sqrt(x0 * x0 + z0 * z0);
      const orbitX = Math.cos(angle) * orb;
      const orbitZ = Math.sin(angle) * orb;
      const wobY = y0 + Math.sin(t * 0.28 + i * 0.1) * 0.05;

      if (relF > 0.01) {
        const dx = px - x;
        const dy = py - y;
        const dz = pz - z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < ar2) {
          const str = ATTRACT_STR_RING * (1 - d2 / ar2) * relF;
          vx += dx * str;
          vy += dy * str;
          vz += dz * str;
        }
      }

      vx += (orbitX - x) * SPRING_K_START * 0.5;
      vy += (wobY - y) * SPRING_K_START * 0.4;
      vz += (orbitZ - z) * SPRING_K_START * 0.5;

      vx *= DAMPING_START;
      vy *= DAMPING_START;
      vz *= DAMPING_START;
      x += vx;
      y += vy;
      z += vz;

      rPos[i3] = x;
      rPos[i3 + 1] = y;
      rPos[i3 + 2] = z;
      rVel[i3] = vx;
      rVel[i3 + 1] = vy;
      rVel[i3 + 2] = vz;
    }

    (ringGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate =
      true;

    // ── Ring lines ────────────────────────────────────────────────────────
    const rlAttr = rLinesGeo.getAttribute("position") as THREE.BufferAttribute;
    const rlPos = rlAttr.array as Float32Array;
    for (let e = 0; e < rEdges.length; e += 2) {
      const a = rEdges[e];
      const b = rEdges[e + 1];
      const a3 = a * 3;
      const b3 = b * 3;
      const v = (e >> 1) * 6;
      const ax = rPos[a3];
      const ay = rPos[a3 + 1];
      const az = rPos[a3 + 2];
      const bx = rPos[b3];
      const by = rPos[b3 + 1];
      const bz = rPos[b3 + 2];
      const ddx = ax - bx;
      const ddy = ay - by;
      const ddz = az - bz;
      if (ddx * ddx + ddy * ddy + ddz * ddz > mld2) {
        rlPos[v] = ax;
        rlPos[v + 1] = ay;
        rlPos[v + 2] = az;
        rlPos[v + 3] = ax;
        rlPos[v + 4] = ay;
        rlPos[v + 5] = az;
      } else {
        rlPos[v] = ax;
        rlPos[v + 1] = ay;
        rlPos[v + 2] = az;
        rlPos[v + 3] = bx;
        rlPos[v + 4] = by;
        rlPos[v + 5] = bz;
      }
    }
    rlAttr.needsUpdate = true;
  });

  return (
    <>
      <lineSegments ref={planetLinesRef} geometry={pLinesGeo}>
        <lineBasicMaterial
          transparent
          opacity={PLINE_OP_LOW}
          color={COL_PLINE}
          depthWrite={false}
        />
      </lineSegments>
      <lineSegments ref={ringLinesRef} geometry={rLinesGeo}>
        <lineBasicMaterial
          transparent
          opacity={RLINE_OP_LOW}
          color={COL_RLINE}
          depthWrite={false}
        />
      </lineSegments>

      <points ref={starPointsRef} geometry={starsGeo}>
        <pointsMaterial
          size={0.006}
          color={COL_STAR}
          transparent
          opacity={STAR_OP_TOP}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTex}
        />
      </points>
      <points ref={ringPointsRef} geometry={ringGeo}>
        <pointsMaterial
          size={0.017}
          color={COL_RING}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTex}
        />
      </points>
      <points ref={planetPointsRef} geometry={planetGeo}>
        <pointsMaterial
          size={0.022}
          color={COL_PLANET}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTex}
        />
      </points>

      {/* Invisible sphere for click detection — never intercepts UI */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: react-three-fiber mesh events are scene interactions, not DOM static element interactions. */}
      <mesh ref={iMeshRef} onClick={handleClick}>
        <sphereGeometry args={[PLANET_RADIUS * 1.1, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

// ─── Post-processing effects (desktop / full-motion only) ────────────────────

function SceneEffects() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.18}
        luminanceSmoothing={0.9}
        intensity={0.35}
      />
      <ChromaticAberration offset={new THREE.Vector2(0.0004, 0.0004)} />
    </EffectComposer>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────
//
// Props
// ─────
// className      — forwarded to wrapper div (position it how you like)
// sidebarOpen    — true when the right-side chat sidebar is visible
// sidebarWidth   — width of the sidebar in px (default 400)
// positionFixed  — set true if the background is a fixed full-screen overlay
//                  (position:fixed); leave false (default) if it sits inside
//                  a position:relative/absolute content area that already
//                  shrinks when the sidebar opens.
//
// Sidebar behaviour
// ─────────────────
// position:absolute layout (positionFixed=false):
//   The parent element is already narrowed by the sidebar → background just
//   fills its container. No extra work needed; we honour className fully.
//
// position:fixed layout (positionFixed=true):
//   The canvas must shift its own right edge by sidebarWidth so it doesn't
//   bleed under the panel. We also shift left=0 and animate right.

export default function ObsidianBackground({
  className,
  sidebarOpen = false,
  sidebarWidth = 400,
  positionFixed = false,
}: {
  className?: string;
  sidebarOpen?: boolean;
  sidebarWidth?: number;
  positionFixed?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const skipEffects = isMobile || reducedMotion;
  const planetCount = isMobile ? PLANET_COUNT_MOBILE : PLANET_COUNT_DESKTOP;
  const ringCount = isMobile ? RING_COUNT_MOBILE : RING_COUNT_DESKTOP;
  const starCount = isMobile ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;

  const dpr: [number, number] = [
    1,
    Math.min(
      1.25,
      typeof window !== "undefined" ? window.devicePixelRatio : 1.25,
    ),
  ];

  // Build inline styles for both layout modes
  const wrapperStyle: React.CSSProperties = positionFixed
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        right: sidebarOpen ? sidebarWidth : 0,
        zIndex: 0,
        transition: `right ${SIDEBAR_EASE}`,
        overflow: "hidden",
      }
    : {
        // Absolute: lives inside a content area that already adjusts for sidebar.
        // We still animate our right edge as a belt-and-suspenders measure for
        // layouts where the parent doesn't shrink automatically.
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: sidebarOpen ? sidebarWidth : 0,
        zIndex: 0,
        transition: `right ${SIDEBAR_EASE}`,
        overflow: "hidden",
      };

  return (
    <div className={className} style={wrapperStyle}>
      {/* Near-black base */}
      <div style={{ position: "absolute", inset: 0, background: "#05040A" }} />

      {/* Vignette — protects text readability over the star field */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          background:
            "radial-gradient(ellipse 75% 60% at 50% 50%, transparent 25%, rgba(3,2,9,0.56) 100%)",
        }}
      />

      <Suspense fallback={null}>
        <Canvas
          dpr={dpr}
          camera={{ position: CAM_START, fov: 55 }}
          gl={{
            alpha: true,
            antialias: false, // points don't benefit from MSAA
            powerPreference: "high-performance",
          }}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          <Graph
            planetCount={planetCount}
            ringCount={ringCount}
            starCount={starCount}
            skipEffects={skipEffects}
          />
          {!skipEffects && <SceneEffects />}
        </Canvas>
      </Suspense>
    </div>
  );
}
