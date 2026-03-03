"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type GraphConfig = {
  planetCount?: number;
  ringCount?: number;
  starCount?: number;
  planetLinkRadius?: number;
  attractRadius?: number;
  attractStrengthPlanet?: number;
  attractStrengthRing?: number;
  baseDrift?: number;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function createPointSprite(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 64, 64);

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function fibonacciSphere(N: number, radius: number) {
  const points = [];
  const golden_angle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < N; i++) {
    const y = ((i / (N - 1)) * 2 - 1) * radius;
    const radiusAtY = Math.sqrt(Math.max(0, radius * radius - y * y));

    const theta = golden_angle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    const noise =
      (Math.sin(theta * 3) * 0.02 + Math.cos(theta * 5) * 0.015) * radius;
    points.push([x + noise * 0.3, y, z + noise * 0.3]);
  }

  return points;
}

function createRing(
  majorRadius: number,
  minorRadius: number,
  numMajor: number,
  numMinor: number,
  tiltX: number,
  tiltZ: number,
) {
  const points = [];

  for (let i = 0; i < numMajor; i++) {
    const theta = (i / numMajor) * Math.PI * 2;

    for (let j = 0; j < numMinor; j++) {
      const phi = (j / numMinor) * Math.PI * 2;

      const x = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
      const y = minorRadius * Math.sin(phi);
      const z = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);

      let y2 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
      const z2 = y * Math.sin(tiltX) + z * Math.cos(tiltX);

      const x2 = x * Math.cos(tiltZ) - y2 * Math.sin(tiltZ);
      y2 = x * Math.sin(tiltZ) + y2 * Math.cos(tiltZ);

      points.push([x2, y2, z2]);
    }
  }

  return points;
}

function createStars(N: number, volume: number = 30) {
  const points = [];
  for (let i = 0; i < N; i++) {
    const x = (Math.random() - 0.5) * volume;
    const y = (Math.random() - 0.5) * volume;
    const z = (Math.random() - 0.5) * volume - 10;
    points.push([x, y, z]);
  }
  return points;
}

function Graph({ config }: { config: GraphConfig }) {
  const {
    planetCount = 3000,
    ringCount = 2400,
    starCount = 5000,
    planetLinkRadius = 0.32,
    attractRadius = 2.2,
    attractStrengthPlanet = 0.18,
    attractStrengthRing = 0.1,
    baseDrift = 0.006,
  } = config;

  const planetPointsRef = useRef<THREE.Points>(null);
  const ringPointsRef = useRef<THREE.Points>(null);
  const starPointsRef = useRef<THREE.Points>(null);
  const planetGlowRef = useRef<THREE.Points>(null);
  const planetLinesRef = useRef<THREE.LineSegments>(null);
  const ringLinesRef = useRef<THREE.LineSegments>(null);

  const pointer = useRef(new THREE.Vector2(0, 0));
  const pointerWorldPos = useRef(new THREE.Vector3(0, 0, -10));
  const pointerActive = useRef(true);
  const releaseTimer = useRef(0);
  const scroll01 = useRef(0);

  const exploded = useRef(false);
  const explosionTimer = useRef(0);

  const { camera } = useThree();

  const pointTexture = useMemo(() => createPointSprite(), []);

  const {
    planetPositions0,
    planetPositions,
    planetVelocities,
    planetNormals,
    ringPositions0,
    ringPositions,
    ringVelocities,
    ringAngles0,
    starPositions,
    planetEdges,
    ringEdges,
  } = useMemo(() => {
    // PLANET
    const planetPts = fibonacciSphere(planetCount, 0.8);
    const planetPositions0 = new Float32Array(planetCount * 3);
    const planetPositions = new Float32Array(planetCount * 3);
    const planetVelocities = new Float32Array(planetCount * 3);
    const planetNormals = new Float32Array(planetCount * 3);

    for (let i = 0; i < planetCount; i++) {
      planetPositions0[i * 3] = planetPts[i][0];
      planetPositions0[i * 3 + 1] = planetPts[i][1];
      planetPositions0[i * 3 + 2] = planetPts[i][2];
      planetPositions[i * 3] = planetPts[i][0];
      planetPositions[i * 3 + 1] = planetPts[i][1];
      planetPositions[i * 3 + 2] = planetPts[i][2];

      const nx = planetPts[i][0];
      const ny = planetPts[i][1];
      const nz = planetPts[i][2];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      planetNormals[i * 3] = nx / len;
      planetNormals[i * 3 + 1] = ny / len;
      planetNormals[i * 3 + 2] = nz / len;
    }

    // Planet edges
    const planetLinks: number[] = [];
    for (let i = 0; i < planetCount; i++) {
      const ix = planetPositions0[i * 3];
      const iy = planetPositions0[i * 3 + 1];
      const iz = planetPositions0[i * 3 + 2];

      const candidates: { j: number; d2: number }[] = [];
      for (let j = i + 1; j < planetCount; j++) {
        const jx = planetPositions0[j * 3];
        const jy = planetPositions0[j * 3 + 1];
        const jz = planetPositions0[j * 3 + 2];
        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 <= planetLinkRadius * planetLinkRadius) {
          candidates.push({ j, d2 });
        }
      }
      candidates.sort((a, b) => a.d2 - b.d2);
      const take = Math.min(4, candidates.length);
      for (let k = 0; k < take; k++) {
        planetLinks.push(i, candidates[k].j);
      }
    }

    // RING
    const ringPts = createRing(
      2.6,
      0.5,
      150,
      16,
      Math.PI * 0.3,
      Math.PI * 0.12,
    );
    const ringPositions0 = new Float32Array(ringCount * 3);
    const ringPositions = new Float32Array(ringCount * 3);
    const ringVelocities = new Float32Array(ringCount * 3);
    const ringAngles0 = new Float32Array(ringCount);

    for (let i = 0; i < ringCount; i++) {
      ringPositions0[i * 3] = ringPts[i][0];
      ringPositions0[i * 3 + 1] = ringPts[i][1];
      ringPositions0[i * 3 + 2] = ringPts[i][2];
      ringPositions[i * 3] = ringPts[i][0];
      ringPositions[i * 3 + 1] = ringPts[i][1];
      ringPositions[i * 3 + 2] = ringPts[i][2];

      ringAngles0[i] = Math.atan2(ringPts[i][2], ringPts[i][0]);
    }

    // Ring edges: sparse, mostly boundary only
    const ringLinks: number[] = [];
    const numMajor = 150;
    const numMinor = 16;
    const innerEdgeIdx: number[] = [];
    const outerEdgeIdx: number[] = [];

    for (let i = 0; i < numMajor; i++) {
      innerEdgeIdx.push(i * numMinor);
      outerEdgeIdx.push(i * numMinor + (numMinor - 1));
    }

    for (let i = 0; i < innerEdgeIdx.length - 1; i++) {
      ringLinks.push(innerEdgeIdx[i], innerEdgeIdx[i + 1]);
    }
    ringLinks.push(innerEdgeIdx[innerEdgeIdx.length - 1], innerEdgeIdx[0]);

    for (let i = 0; i < outerEdgeIdx.length - 1; i++) {
      ringLinks.push(outerEdgeIdx[i], outerEdgeIdx[i + 1]);
    }
    ringLinks.push(outerEdgeIdx[outerEdgeIdx.length - 1], outerEdgeIdx[0]);

    for (let i = 0; i < numMajor; i += 10) {
      ringLinks.push(innerEdgeIdx[i], outerEdgeIdx[i]);
    }

    // STARS
    const starPts = createStars(starCount);
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = starPts[i][0];
      starPositions[i * 3 + 1] = starPts[i][1];
      starPositions[i * 3 + 2] = starPts[i][2];
    }

    return {
      planetPositions0,
      planetPositions,
      planetVelocities,
      planetNormals,
      ringPositions0,
      ringPositions,
      ringVelocities,
      ringAngles0,
      starPositions,
      planetEdges: new Uint32Array(planetLinks),
      ringEdges: new Uint32Array(ringLinks),
    };
  }, [planetCount, ringCount, starCount, planetLinkRadius]);

  const planetGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(planetPositions, 3));
    return g;
  }, [planetPositions]);

  const ringGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
    return g;
  }, [ringPositions]);

  const starsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    return g;
  }, [starPositions]);

  const planetLinesGeo = useMemo(() => {
    const segCount = planetEdges.length / 2;
    const linePositions = new Float32Array(segCount * 2 * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    return g;
  }, [planetEdges]);

  const ringLinesGeo = useMemo(() => {
    const segCount = ringEdges.length / 2;
    const linePositions = new Float32Array(segCount * 2 * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    return g;
  }, [ringEdges]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.current.set(x, y);
      pointerActive.current = true;
      releaseTimer.current = 0;

      const vec = new THREE.Vector3(x, y, 0.5);
      vec.unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      pointerWorldPos.current.copy(camera.position).addScaledVector(dir, 5);
    };

    const onLeave = () => {
      pointerActive.current = false;
      releaseTimer.current = 0.5;
    };

    const onClick = () => {
      exploded.current = !exploded.current;
      explosionTimer.current = 0;
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
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, [camera]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const s = scroll01.current;
    const dt = state.clock.getDelta();

    if (!pointerActive.current && releaseTimer.current > 0) {
      releaseTimer.current -= dt;
    }
    const releaseProgress = Math.max(
      0,
      Math.min(1, releaseTimer.current / 0.5),
    );

    if (exploded.current) {
      explosionTimer.current += dt;
    }
    const explosionProgress = Math.min(1, explosionTimer.current / 2.0);
    if (explosionProgress >= 1) {
      exploded.current = false;
    }

    const easeS = s < 0.3 ? 2 * s * s : -1 + (4 - 2 * s) * s;

    camera.position.x = THREE.MathUtils.lerp(3.5, 0.2, easeS);
    camera.position.y = THREE.MathUtils.lerp(2.8, 0.1, easeS);
    camera.position.z = THREE.MathUtils.lerp(5.2, 2.0, easeS);
    camera.lookAt(0, 0, 0);

    if (planetGlowRef.current) {
      const mat = planetGlowRef.current.material as THREE.PointsMaterial;
      mat.size = 0.028 + Math.sin(t * 1.8) * 0.01;
      mat.opacity = 0.1 + Math.sin(t * 1.3) * 0.05;
    }

    if (planetLinesRef.current) {
      const mat = planetLinesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(0.1, 0.4, easeS);
    }
    if (ringLinesRef.current) {
      const mat = ringLinesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(0.05, 0.2, easeS);
    }

    let px = pointerWorldPos.current.x;
    let py = pointerWorldPos.current.y;
    let pz = pointerWorldPos.current.z;

    if (!pointerActive.current) {
      px *= releaseProgress ** 0.6;
      py *= releaseProgress ** 0.6;
      pz = THREE.MathUtils.lerp(pz, -10, 1 - releaseProgress);
    }

    const drift = baseDrift * (1 + easeS * 0.5);
    const springK = 0.08;
    const damping = 0.92;

    // UPDATE PLANET
    for (let i = 0; i < planetPositions.length / 3; i++) {
      const idx = i * 3;
      const x0 = planetPositions0[idx];
      const y0 = planetPositions0[idx + 1];
      const z0 = planetPositions0[idx + 2];

      let x = planetPositions[idx];
      let y = planetPositions[idx + 1];
      let z = planetPositions[idx + 2];

      let vx = planetVelocities[idx];
      let vy = planetVelocities[idx + 1];
      let vz = planetVelocities[idx + 2];

      const nx = Math.sin(t * 0.4 + x0 * 3) * drift;
      const ny = Math.cos(t * 0.35 + y0 * 2.8) * drift;

      if (exploded.current) {
        const nX = planetNormals[idx];
        const nY = planetNormals[idx + 1];
        const nZ = planetNormals[idx + 2];
        const explosionStr = 1.5 * (1 - explosionProgress);
        vx += nX * explosionStr;
        vy += nY * explosionStr;
        vz += nZ * explosionStr;
      }

      const dx = px - x;
      const dy = py - y;
      const dz = pz - z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const r2 = attractRadius * attractRadius;
      if (d2 < r2 && pointerActive.current) {
        const falloff = 1 - d2 / r2;
        const attractStr = attractStrengthPlanet * falloff;
        vx += dx * attractStr;
        vy += dy * attractStr;
        vz += dz * attractStr;
      }

      const dx0 = x0 * (1 - easeS * 0.05) - x;
      const dy0 = y0 * (1 - easeS * 0.05) - y;
      const dz0 = z0 * (1 - easeS * 0.05) - z;
      vx += dx0 * springK + nx;
      vy += dy0 * springK + ny;
      vz += dz0 * springK;

      vx *= damping;
      vy *= damping;
      vz *= damping;

      x += vx;
      y += vy;
      z += vz;

      planetPositions[idx] = x;
      planetPositions[idx + 1] = y;
      planetPositions[idx + 2] = z;
      planetVelocities[idx] = vx;
      planetVelocities[idx + 1] = vy;
      planetVelocities[idx + 2] = vz;
    }

    const planetPAttr = planetGeo.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    planetPAttr.needsUpdate = true;

    const planetLAttr = planetLinesGeo.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const planetLinePos = planetLAttr.array as Float32Array;
    for (let e = 0; e < planetEdges.length; e += 2) {
      const a = planetEdges[e];
      const b = planetEdges[e + 1];
      const a3 = a * 3;
      const b3 = b * 3;
      const v = (e / 2) * 6;
      planetLinePos[v] = planetPositions[a3];
      planetLinePos[v + 1] = planetPositions[a3 + 1];
      planetLinePos[v + 2] = planetPositions[a3 + 2];
      planetLinePos[v + 3] = planetPositions[b3];
      planetLinePos[v + 4] = planetPositions[b3 + 1];
      planetLinePos[v + 5] = planetPositions[b3 + 2];
    }
    planetLAttr.needsUpdate = true;

    // UPDATE RING
    for (let i = 0; i < ringPositions.length / 3; i++) {
      const idx = i * 3;
      const x0 = ringPositions0[idx];
      const y0 = ringPositions0[idx + 1];
      const z0 = ringPositions0[idx + 2];

      let x = ringPositions[idx];
      let y = ringPositions[idx + 1];
      let z = ringPositions[idx + 2];

      let vx = ringVelocities[idx];
      let vy = ringVelocities[idx + 1];
      let vz = ringVelocities[idx + 2];

      const angle = ringAngles0[i] + t * 0.08;
      const orbitalRadius = Math.sqrt(x0 * x0 + z0 * z0);
      const orbitX = Math.cos(angle) * orbitalRadius;
      const orbitZ = Math.sin(angle) * orbitalRadius;

      const wobble = Math.sin(t * 0.3 + i * 0.1) * 0.08;
      const wobbleY = y0 + wobble;

      const dx = px - x;
      const dy = py - y;
      const dz = pz - z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const r2 = attractRadius * attractRadius;
      if (d2 < r2 && pointerActive.current) {
        const falloff = 1 - d2 / r2;
        const attractStr = attractStrengthRing * falloff;
        vx += dx * attractStr;
        vy += dy * attractStr;
        vz += dz * attractStr;
      }

      vx += (orbitX - x) * springK * 0.6;
      vy += (wobbleY - y) * springK * 0.5;
      vz += (orbitZ - z) * springK * 0.6;

      vx *= damping;
      vy *= damping;
      vz *= damping;

      x += vx;
      y += vy;
      z += vz;

      ringPositions[idx] = x;
      ringPositions[idx + 1] = y;
      ringPositions[idx + 2] = z;
      ringVelocities[idx] = vx;
      ringVelocities[idx + 1] = vy;
      ringVelocities[idx + 2] = vz;
    }

    const ringPAttr = ringGeo.getAttribute("position") as THREE.BufferAttribute;
    ringPAttr.needsUpdate = true;

    const ringLAttr = ringLinesGeo.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const ringLinePos = ringLAttr.array as Float32Array;
    for (let e = 0; e < ringEdges.length; e += 2) {
      const a = ringEdges[e];
      const b = ringEdges[e + 1];
      const a3 = a * 3;
      const b3 = b * 3;
      const v = (e / 2) * 6;
      ringLinePos[v] = ringPositions[a3];
      ringLinePos[v + 1] = ringPositions[a3 + 1];
      ringLinePos[v + 2] = ringPositions[a3 + 2];
      ringLinePos[v + 3] = ringPositions[b3];
      ringLinePos[v + 4] = ringPositions[b3 + 1];
      ringLinePos[v + 5] = ringPositions[b3 + 2];
    }
    ringLAttr.needsUpdate = true;
  });

  return (
    <>
      <lineSegments ref={planetLinesRef} geometry={planetLinesGeo}>
        <lineBasicMaterial
          transparent
          opacity={0.14}
          color="#A78BFA"
          linewidth={1}
        />
      </lineSegments>

      <lineSegments ref={ringLinesRef} geometry={ringLinesGeo}>
        <lineBasicMaterial
          transparent
          opacity={0.07}
          color="#C08FFF"
          linewidth={1}
        />
      </lineSegments>

      <points ref={starPointsRef} geometry={starsGeo}>
        <pointsMaterial
          size={0.006}
          color="#FFFFFF"
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTexture}
        />
      </points>

      <points ref={ringPointsRef} geometry={ringGeo}>
        <pointsMaterial
          size={0.02}
          color="#B19CD9"
          transparent
          opacity={0.68}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTexture}
        />
      </points>

      <points ref={planetPointsRef} geometry={planetGeo}>
        <pointsMaterial
          size={0.028}
          color="#A78BFA"
          transparent
          opacity={0.85}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTexture}
        />
      </points>

      <points ref={planetGlowRef} geometry={planetGeo}>
        <pointsMaterial
          size={0.045}
          color="#C08FFF"
          transparent
          opacity={0.1}
          depthWrite={false}
          sizeAttenuation={true}
          alphaMap={pointTexture}
        />
      </points>

      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 9, 4]} intensity={0.55} />
    </>
  );
}

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

  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#0F0A1A",
        }}
      />
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [3.5, 2.8, 5.2], fov: 55 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
        >
          <Graph config={{}} />
        </Canvas>
      </Suspense>
    </div>
  );
}
