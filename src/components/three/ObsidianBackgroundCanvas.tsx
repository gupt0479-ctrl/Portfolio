"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════════════════════
// TUNING CONSTANTS — edit these to dial in the feel
// ═══════════════════════════════════════════════════════════════════════════════

// Counts
const PLANET_COUNT = 2800;
const RING_COUNT = 2000; // actual count = floor(RING_COUNT/16)*16
const STAR_COUNT = 5500;

// Geometry
const PLANET_RADIUS = 0.8;
const RING_MAJOR_RADIUS = 2.6;
const RING_MINOR_RADIUS = 0.5;

// Planet edges — smaller = fewer lines, lower overdraw
const PLANET_LINK_RADIUS = 0.27; // chord distance for edge creation
const MAX_EDGES_PER_POINT = 3; // hard cap per point
const MAX_LINE_DIST = 0.42; // hide segment if endpoints drift beyond this

// Hover magnet
const ATTRACT_RADIUS = 2.0;
const ATTRACT_STR_PLANET = 0.055; // was 0.18 — reduced
const ATTRACT_STR_RING = 0.035;
const TANGENTIAL_BLEND = 0.82; // 1 = fully tangential, 0 = radial pull
const MAX_DISPLACE = 0.2; // hard cap on displacement from rest position

// Click burst
const BURST_STRENGTH = 0.2;
const BURST_DURATION = 1.8; // seconds
const BURST_SHELL_MAX = PLANET_RADIUS * 1.12;

// Spring / damping
const SPRING_K = 0.09;
const DAMPING = 0.91;
const BASE_DRIFT = 0.005;

// Camera — scroll start → end
const CAM_START: [number, number, number] = [3.5, 2.8, 5.2];
const CAM_END: [number, number, number] = [0.5, 0.3, 3.1]; // z raised from 2.0 → 3.1

// Line opacities — (rest, max-scroll) × fade-during-burst
const PLINE_OP_LOW = 0.055;
const PLINE_OP_HIGH = 0.12;
const RLINE_OP_LOW = 0.025;
const RLINE_OP_HIGH = 0.06;

// Colors — muted lavender / gray-violet
const COL_PLANET = "#9D8BBF";
const COL_RING = "#8A7AAE";
const COL_PLINE = "#8A7AAE";
const COL_RLINE = "#8A7AAE";
const COL_STAR = "#C8C2DC";

// ═══════════════════════════════════════════════════════════════════════════════

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function createPointSprite(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.65)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
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

// ─── Graph ──────────────────────────────────────────────────────────────────

function Graph() {
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
  const burstTimer = useRef(-1);
  const burstActive = useRef(false);

  const { camera } = useThree();
  const pointTex = useMemo(() => createPointSprite(), []);

  // ── Precompute all per-point constants once ────────────────────────────────
  const data = useMemo(() => {
    // Planet
    const pPts = fibonacciSphere(PLANET_COUNT, PLANET_RADIUS);
    const pPos0 = new Float32Array(PLANET_COUNT * 3);
    const pPos = new Float32Array(PLANET_COUNT * 3);
    const pVel = new Float32Array(PLANET_COUNT * 3);
    const pNorm = new Float32Array(PLANET_COUNT * 3);
    const pPhase = new Float32Array(PLANET_COUNT);

    for (let i = 0; i < PLANET_COUNT; i++) {
      const i3 = i * 3;
      pPos0[i3] = pPos[i3] = pPts[i][0];
      pPos0[i3 + 1] = pPos[i3 + 1] = pPts[i][1];
      pPos0[i3 + 2] = pPos[i3 + 2] = pPts[i][2];
      const len =
        Math.sqrt(pPts[i][0] ** 2 + pPts[i][1] ** 2 + pPts[i][2] ** 2) || 1;
      pNorm[i3] = pPts[i][0] / len;
      pNorm[i3 + 1] = pPts[i][1] / len;
      pNorm[i3 + 2] = pPts[i][2] / len;
      pPhase[i] = (i / PLANET_COUNT) * Math.PI * 2;
    }

    // Planet edges — capped at MAX_EDGES_PER_POINT
    const pLinks: number[] = [];
    for (let i = 0; i < PLANET_COUNT; i++) {
      const i3 = i * 3;
      const ix = pPos0[i3];
      const iy = pPos0[i3 + 1];
      const iz = pPos0[i3 + 2];
      let taken = 0;
      for (
        let j = i + 1;
        j < PLANET_COUNT && taken < MAX_EDGES_PER_POINT;
        j++
      ) {
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
    const nMajor = Math.floor(RING_COUNT / 16);
    const nMinor = 16;
    const rPts = createRing(
      RING_MAJOR_RADIUS,
      RING_MINOR_RADIUS,
      nMajor,
      nMinor,
      Math.PI * 0.3,
      Math.PI * 0.12,
    );
    const rc = Math.min(RING_COUNT, rPts.length);
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

    // Ring edges — inner + outer loops + sparse spokes
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
    const sPts = createStars(STAR_COUNT);
    const sPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
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
  }, []);

  // ── Geometries ─────────────────────────────────────────────────────────────
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

  // ── Events ─────────────────────────────────────────────────────────────────
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
      releaseTimer.current = 0.5;
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

  // Click handler — mesh only, stops propagation so UI buttons are not affected
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    burstActive.current = true;
    burstTimer.current = 0;
  };

  // ── useFrame — no allocations ───────────────────────────────────────────────
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(state.clock.getDelta(), 0.05);
    const s = scroll01.current;

    // Release fade
    if (!pointerActive.current && releaseTimer.current > 0) {
      releaseTimer.current = Math.max(0, releaseTimer.current - dt);
    }
    const relF = pointerActive.current
      ? 1.0
      : clamp01(releaseTimer.current / 0.5);

    // Burst progress
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

    // Scroll ease
    const easeS = s < 0.5 ? 2 * s * s : -1 + (4 - 2 * s) * s;

    // Camera
    camera.position.x = THREE.MathUtils.lerp(CAM_START[0], CAM_END[0], easeS);
    camera.position.y = THREE.MathUtils.lerp(CAM_START[1], CAM_END[1], easeS);
    camera.position.z = THREE.MathUtils.lerp(CAM_START[2], CAM_END[2], easeS);
    camera.lookAt(0, 0, 0);

    // Line opacity — fades mid-burst
    const burstFade = burstActive.current
      ? 1 - Math.sin(clamp01(burstP) * Math.PI) * 0.55
      : 1;
    if (planetLinesRef.current) {
      (planetLinesRef.current.material as THREE.LineBasicMaterial).opacity =
        THREE.MathUtils.lerp(PLINE_OP_LOW, PLINE_OP_HIGH, easeS) * burstFade;
    }
    if (ringLinesRef.current) {
      (ringLinesRef.current.material as THREE.LineBasicMaterial).opacity =
        THREE.MathUtils.lerp(RLINE_OP_LOW, RLINE_OP_HIGH, easeS) * burstFade;
    }

    // Star subtle global twinkle based on hover presence
    if (starPointsRef.current) {
      const mat = starPointsRef.current.material as THREE.PointsMaterial;
      const twinkle = Math.sin(t * 0.7) * 0.04;
      mat.opacity = 0.38 + twinkle + relF * 0.06;
    }

    // Effective pointer world (fades when released)
    const pw = pointerWorld.current;
    const px = pw.x * relF;
    const py = pw.y * relF;
    const pz = pointerActive.current
      ? pw.z
      : THREE.MathUtils.lerp(pw.z, -10, 1 - relF);

    const drift = BASE_DRIFT * (1 + easeS * 0.35);
    const ar2 = ATTRACT_RADIUS * ATTRACT_RADIUS;
    const md2 = MAX_DISPLACE * MAX_DISPLACE;
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

    // ── Planet ──────────────────────────────────────────────────────────────
    for (let i = 0; i < PLANET_COUNT; i++) {
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

      // Gentle drift
      vx += Math.sin(t * 0.4 + x0 * 3.0) * drift;
      vy += Math.cos(t * 0.35 + y0 * 2.8) * drift;

      // Hover magnet — tangential biased to prevent silhouette collapse
      if (relF > 0.01) {
        const dx = px - x;
        const dy = py - y;
        const dz = pz - z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < ar2) {
          const falloff = 1 - d2 / ar2;
          const str = ATTRACT_STR_PLANET * falloff * relF;
          const nx = pNorm[i3];
          const ny = pNorm[i3 + 1];
          const nz = pNorm[i3 + 2];
          const radComp = dx * nx + dy * ny + dz * nz; // radial projection
          const tax = dx - radComp * nx;
          const tay = dy - radComp * ny;
          const taz = dz - radComp * nz;
          const tb = TANGENTIAL_BLEND;
          vx += (tax * tb + dx * (1 - tb)) * str;
          vy += (tay * tb + dy * (1 - tb)) * str;
          vz += (taz * tb + dz * (1 - tb)) * str;
        }
      }

      // Click burst — deterministic ripple wave along normal
      if (burstActive.current && burstP > 0) {
        const wave = Math.sin(pPhase[i] - burstP * Math.PI * 4) * (1 - burstP);
        const bStr = BURST_STRENGTH * wave;
        vx += pNorm[i3] * bStr;
        vy += pNorm[i3 + 1] * bStr;
        vz += pNorm[i3 + 2] * bStr;
      }

      // Spring back to rest
      vx += (x0 - x) * SPRING_K;
      vy += (y0 - y) * SPRING_K;
      vz += (z0 - z) * SPRING_K;

      vx *= DAMPING;
      vy *= DAMPING;
      vz *= DAMPING;

      x += vx;
      y += vy;
      z += vz;

      // ── Hard displacement clamp — prevent core collapse ──────────────────
      const ddx = x - x0;
      const ddy = y - y0;
      const ddz = z - z0;
      const disp2 = ddx * ddx + ddy * ddy + ddz * ddz;
      if (disp2 > md2) {
        const sc = MAX_DISPLACE / Math.sqrt(disp2);
        x = x0 + ddx * sc;
        y = y0 + ddy * sc;
        z = z0 + ddz * sc;
        vx *= 0.4;
        vy *= 0.4;
        vz *= 0.4;
      }

      // ── Burst shell clamp ────────────────────────────────────────────────
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

    // ── Planet lines (hide stretched segments) ──────────────────────────────
    const plAttr = pLinesGeo.getAttribute("position") as THREE.BufferAttribute;
    const plPos = plAttr.array as Float32Array;
    const pEdLen = pEdges.length;
    const mld2 = MAX_LINE_DIST * MAX_LINE_DIST;
    for (let e = 0; e < pEdLen; e += 2) {
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
        // Degenerate — both to same point = invisible
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

    // ── Ring ─────────────────────────────────────────────────────────────────
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
      const wobY = y0 + Math.sin(t * 0.28 + i * 0.1) * 0.055;

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

      vx += (orbitX - x) * SPRING_K * 0.5;
      vy += (wobY - y) * SPRING_K * 0.4;
      vz += (orbitZ - z) * SPRING_K * 0.5;

      vx *= DAMPING;
      vy *= DAMPING;
      vz *= DAMPING;
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

    // ── Ring lines (hide stretched segments) ────────────────────────────────
    const rlAttr = rLinesGeo.getAttribute("position") as THREE.BufferAttribute;
    const rlPos = rlAttr.array as Float32Array;
    const rEdLen = rEdges.length;
    for (let e = 0; e < rEdLen; e += 2) {
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
      {/* Lines */}
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

      {/* Stars */}
      <points ref={starPointsRef} geometry={starsGeo}>
        <pointsMaterial
          size={0.005}
          color={COL_STAR}
          transparent
          opacity={0.38}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTex}
        />
      </points>

      {/* Ring */}
      <points ref={ringPointsRef} geometry={ringGeo}>
        <pointsMaterial
          size={0.017}
          color={COL_RING}
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTex}
        />
      </points>

      {/* Planet */}
      <points ref={planetPointsRef} geometry={planetGeo}>
        <pointsMaterial
          size={0.022}
          color={COL_PLANET}
          transparent
          opacity={0.68}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTex}
        />
      </points>

      {/* Invisible interaction sphere — click detection only */}
      <mesh ref={iMeshRef} onClick={handleClick}>
        <sphereGeometry args={[PLANET_RADIUS * 1.08, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────

export default function ObsidianBackground({
  className,
}: {
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const dpr: [number, number] = [
    1,
    Math.min(
      1.25,
      typeof window !== "undefined" ? window.devicePixelRatio : 1.25,
    ),
  ];

  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    >
      {/* Near-black base */}
      <div style={{ position: "absolute", inset: 0, background: "#05040A" }} />

      {/* Vignette overlay — radial darken at edges to protect text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          background:
            "radial-gradient(ellipse 72% 58% at 50% 50%, transparent 28%, rgba(3,2,9,0.62) 100%)",
        }}
      />

      <Suspense fallback={null}>
        <Canvas
          dpr={dpr}
          camera={{ position: CAM_START, fov: 55 }}
          gl={{
            alpha: true,
            antialias: false, // slight perf win; dots don't need MSAA
            powerPreference: "high-performance",
          }}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          <Graph />
        </Canvas>
      </Suspense>
    </div>
  );
}
