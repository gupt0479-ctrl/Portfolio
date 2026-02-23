"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense } from "react";

type GraphConfig = {
  count?: number;
  maxLinksPerNode?: number;
  linkRadius?: number;
  attractRadius?: number;
  attractStrength?: number;
  baseDrift?: number;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function Graph({ config }: { config: GraphConfig }) {
  const {
    count = 250,
    maxLinksPerNode = 3,
    linkRadius = 0.15,
    attractRadius = 0.25,
    attractStrength = 0.05,
    baseDrift = 0.0025,
  } = config;

  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const scroll01 = useRef(0);

  const { viewport, camera } = useThree();

  // Generate nodes and edges
  const { positions0, positions, edges } = useMemo(() => {
    const positions0 = new Float32Array(count * 5);
    const positions = new Float32Array(count * 5);

    for (let i = 0; i < count; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = side * (0.55 + Math.random() * 0.75); // pushes to left/right bands
      const y = (Math.random() * 2 - 1) * 0.65;
      const z = (Math.random() * 2 - 1) * 0.35;
      positions0.set([x, y, z, Math.random(), Math.random()], i * 5);
      positions.set([x, y, z], i * 3);
    }

    const links: number[] = [];
    for (let i = 0; i < count; i++) {
      const ix = positions0[i * 5];
      const iy = positions0[i * 5 + 1];
      const iz = positions0[i * 5 + 2];

      const candidates: { j: number; d2: number }[] = [];
      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const jx = positions0[j * 5];

        const jy = positions0[j * 5 + 1];
        const jz = positions0[j * 5 + 2];
        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 <= linkRadius * linkRadius) {
          candidates.push({ j, d2 });
        }
      }
      candidates.sort((a, b) => a.d2 - b.d2);

      const take = Math.min(maxLinksPerNode, candidates.length);
      for (let k = 0; k < take; k++) {
        links.push(i, candidates[k].j);
      }
    }

    return { positions0, positions, edges: new Uint16Array(links) };
  }, [count, maxLinksPerNode, linkRadius]);

  const pointsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const linesGeo = useMemo(() => {
    const segCount = edges.length / 2;
    const linePositions = new Float32Array(segCount * 2 * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    return g;
  }, [edges]);

  const dotTexture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.6, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.current.set(x, y);
    };

    const onScroll = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      scroll01.current = clamp01(window.scrollY / max);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const s = scroll01.current;

    camera.position.z = THREE.MathUtils.lerp(2.8, 1.1, s);
    camera.position.x = THREE.MathUtils.lerp(0, 0.25, s);
    camera.position.y = THREE.MathUtils.lerp(0, -0.2, s);
    camera.lookAt(0, 0, 0);

    const px = pointer.current.x * viewport.width * 0.12;
    const py = pointer.current.y * viewport.height * 0.12;
    const gap = THREE.MathUtils.lerp(1.25, 0.35, s); // 1.25 = wide gap at top, 0.35 = closes later
    const drop = THREE.MathUtils.lerp(0.0, -0.22, s); // move the whole formation slightly down
    const drift = baseDrift * (1 + s * 1.4);
    const attract = attractStrength * (1 + s * 1.0);

    for (let i = 0; i < positions.length / 3; i++) {
      const idx = i * 3;
      const x0 = positions0[idx];
      const y0 = positions0[idx + 1];
      const z0 = positions0[idx + 2];

      let x = positions[idx];
      let y = positions[idx + 1];
      let z = positions[idx + 2];

      const nx = Math.sin(t * 0.6 + x0 * 2.2) * drift;
      const ny = Math.cos(t * 0.7 + y0 * 2.1) * drift;
      const targetX = x0 * gap;
      const targetY = y0 + drop;
      x += (targetX + nx - x) * 0.02;
      y += (targetY + ny - y) * 0.02;

      const dx = px - x;
      const dy = py - y;
      const d2 = dx * dx + dy * dy;
      const r2 = attractRadius * attractRadius;
      if (d2 < r2) {
        const k = (1 - d2 / r2) * attract;
        x += dx * k;
        y += dy * k;
      }

      x += (x0 + nx - x) * 0.02;
      y += (y0 + ny - y) * 0.02;
      z += (z0 - z) * 0.02;
      camera.position.z = THREE.MathUtils.lerp(2.8, 1.1, s);
      camera.position.y = THREE.MathUtils.lerp(0.0, -0.35, s);
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;
    }

    const pAttr = pointsGeo.getAttribute("position") as THREE.BufferAttribute;
    pAttr.needsUpdate = true;

    const lAttr = linesGeo.getAttribute("position") as THREE.BufferAttribute;
    const linePos = lAttr.array as Float32Array;
    for (let e = 0; e < edges.length; e += 2) {
      const a = edges[e];
      const b = edges[e + 1];
      const a3 = a * 3;
      const b3 = b * 3;
      const v = (e / 2) * 6;
      linePos[v] = positions[a3];
      linePos[v + 1] = positions[a3 + 1];
      linePos[v + 2] = positions[a3 + 2];
      linePos[v + 3] = positions[b3];
      linePos[v + 4] = positions[b3 + 1];
      linePos[v + 5] = positions[b3 + 2];
    }
    lAttr.needsUpdate = true;

    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(0.22, 0.35, s);
    }
  });

  return (
    <>
      <lineSegments ref={linesRef} geometry={linesGeo}>
        <lineBasicMaterial
          transparent
          opacity={0.28}
          color="#C08FFF"
          linewidth={1}
        />
      </lineSegments>
      <points ref={pointsRef} geometry={pointsGeo}>
        <pointsMaterial
          size={0.018}
          color="#C08FFF"
          transparent
          opacity={0.9}
          depthWrite={false}
          map={dotTexture ?? undefined}
          alphaMap={dotTexture ?? undefined}
          alphaTest={0.15}
        />
      </points>
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
          background:
            "radial-gradient(1200px 800px at 30% 20%, rgba(192,143,255,0.14), transparent 60%), radial-gradient(900px 700px at 70% 40%, rgba(36,121,255,0.10), transparent 60%), #080A14",
        }}
      />
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 2.35], fov: 55 }}
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
