"use client";

import { Html, Line, MeshDistortMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CometCard } from "@/components/ui/comet-card";
import { urlFor } from "@/sanity/lib/image";
import type { Education } from "@/sanity/types";

// ── Layout ────────────────────────────────────────────────────────────────────
// Sorted desc by startDate: [0]=college, [1]=high-school, [2]=middle-school

const BASE_POS: [number, number, number][] = [
  [0, 3.0, 0], // college  — top-centre, closer to header
  [-3.8, 0.5, 0], // high school — far left, raised
  [3.5, -1.5, 0], // middle school — far right, raised
];

// ── Blob appearance ───────────────────────────────────────────────────────────
// All three blobs: same radius + same opacity.
// ONLY differentiator: MeshDistortMaterial.distort

const BLOB_R = 1.2; // bigger for logo visibility
const BLOB_OPACITY = 0.68;

// More deformation: middle school is most deformed, college is perfect circle
const DISTORT = [0, 0.42, 0.68] as const;
const DISTORT_SPEED = [0, 2.0, 3.5] as const;

const BLOB_COLOR = ["#7c3aed", "#4f46e5", "#be185d"] as const;
const BLOB_EMIT = ["#a78bfa", "#818cf8", "#f9a8d4"] as const;
const BLOB_EMIT_I = [2.0, 0.7, 0.3] as const;

// ── Float animation ───────────────────────────────────────────────────────────
const FLOAT_CFG = [
  { speed: 0.8, phase: 0.0, ax: 0.14, ay: 0.12, px: 7.1, py: 5.3 },
  { speed: 1.0, phase: 2.1, ax: 0.12, ay: 0.15, px: 5.9, py: 7.7 },
  { speed: 0.7, phase: 4.5, ax: 0.15, ay: 0.1, px: 6.7, py: 4.9 },
] as const;

// ── Card layout ───────────────────────────────────────────────────────────────
// All cards are to the RIGHT of their blob with enough offset to avoid overlap.
const CARD_X_OFFSETS = [2.4, 2.4, 2.2] as const;

// ── Logo clip-paths ───────────────────────────────────────────────────────────
// More deformed sphere = more deformed image clip
// College: perfect circle, High school: mild deformation, Middle school: most deformed
const LOGO_CLIP = [
  "circle(50%)", // college — perfect sphere, perfect circle
  "ellipse(46% 50% at 52% 48%)", // high school — mild organic deformation
  "polygon(50% 2%, 82% 15%, 97% 50%, 85% 85%, 55% 98%, 20% 88%, 5% 55%, 15% 20%)", // middle school — most deformed
] as const;

// Logo sizes — kept small to fit within the sphere radius in 3D space
const LOGO_SIZE = [56, 48, 42] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface FlowchartItem {
  _id: string;
  degree?: string | null;
  institution?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean | null;
  gpa?: string | null;
  description?: string | null;
  logo?: Education["logo"] | null;
}

type MeshRef = React.MutableRefObject<THREE.Mesh | null>;

// ── EduCard ───────────────────────────────────────────────────────────────────

function EduCard({ edu }: { edu: FlowchartItem }) {
  return (
    <CometCard
      variant="subtle"
      rotateDepth={3.5}
      translateDepth={5}
      className="w-[190px]"
    >
      <div className="p-4 text-left">
        <h3 className="text-sm font-display font-semibold text-white leading-tight line-clamp-2">
          {edu.degree ?? "—"}
        </h3>
        {edu.fieldOfStudy && (
          <p className="text-xs text-white/60 mt-0.5">in {edu.fieldOfStudy}</p>
        )}
        <p className="text-xs text-white/50 mt-1">{edu.institution ?? "—"}</p>
        <p className="text-[10px] text-white/35 mt-1 font-mono">
          {edu.startDate ? new Date(edu.startDate).getFullYear() : ""}
          {" — "}
          {edu.current
            ? "Present"
            : edu.endDate
              ? new Date(edu.endDate).getFullYear()
              : ""}
        </p>
        {edu.gpa && (
          <span className="mt-2 inline-block rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/70">
            GPA: {edu.gpa}
          </span>
        )}
      </div>
    </CometCard>
  );
}

// ── EduBlob ───────────────────────────────────────────────────────────────────
// meshRef is owned by Scene so StretchingLine and TravellingDot can read positions.

function EduBlob({
  edu,
  idx,
  meshRef,
  prefersReduced,
}: {
  edu: FlowchartItem;
  idx: number;
  meshRef: MeshRef;
  prefersReduced: boolean;
}) {
  const cfg = FLOAT_CFG[idx];
  const tRef = useRef(cfg.phase);
  const logoUrl = edu.logo ? urlFor(edu.logo).width(64).height(64).url() : null;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (!prefersReduced) tRef.current += delta * cfg.speed;
    const t = tRef.current;
    const bp = BASE_POS[idx];
    const px =
      bp[0] +
      Math.sin(((Math.PI * 2) / cfg.px) * t) * cfg.ax +
      Math.cos(((Math.PI * 2) / (cfg.px * 1.3)) * t) * (cfg.ax * 0.4);
    const py =
      bp[1] +
      Math.sin(((Math.PI * 2) / cfg.py) * t + 1.2) * cfg.ay +
      Math.cos(((Math.PI * 2) / (cfg.py * 0.85)) * t) * (cfg.ay * 0.4);
    meshRef.current.position.set(px, py, 0);
  });

  return (
    <mesh ref={meshRef} position={BASE_POS[idx]}>
      <sphereGeometry args={[BLOB_R, 64, 64]} />
      <MeshDistortMaterial
        color={BLOB_COLOR[idx]}
        emissive={BLOB_EMIT[idx]}
        emissiveIntensity={BLOB_EMIT_I[idx]}
        distort={DISTORT[idx]}
        speed={prefersReduced ? 0 : DISTORT_SPEED[idx]}
        transparent
        opacity={BLOB_OPACITY}
        roughness={0.15}
        metalness={0.1}
      />

      {/* Logo centred on blob — slight z-offset to render in front of transparent sphere */}
      {logoUrl && (
        <Html
          center
          position={[0, 0, BLOB_R * 0.5]}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              pointerEvents: "none",
              userSelect: "none",
              width: `${LOGO_SIZE[idx]}px`,
              height: `${LOGO_SIZE[idx]}px`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={edu.institution ?? ""}
              width={LOGO_SIZE[idx]}
              height={LOGO_SIZE[idx]}
              style={{
                clipPath: LOGO_CLIP[idx],
                objectFit: "cover",
                display: "block",
                borderRadius: "50%",
                width: `${LOGO_SIZE[idx]}px`,
                height: `${LOGO_SIZE[idx]}px`,
              }}
            />
          </div>
        </Html>
      )}

      {/* Card moves with blob — Html child inherits mesh world transform */}
      <Html position={[CARD_X_OFFSETS[idx], 0, 0]} center>
        <EduCard edu={edu} />
      </Html>
    </mesh>
  );
}

// ── StretchingLine ─────────────────────────────────────────────────────────────
// Dashed line whose endpoints stop at each blob's surface (not the centre).
// Uses drei Line (Line2 shader) for reliable dashed rendering.

function StretchingLine({
  fromRef,
  toRef,
  initFrom,
  initTo,
}: {
  fromRef: MeshRef;
  toRef: MeshRef;
  initFrom: [number, number, number];
  initTo: [number, number, number];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null);
  const pts = useMemo<[[number, number, number], [number, number, number]]>(
    () => [initFrom, initTo],
    [initFrom, initTo],
  );
  const dirVec = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!lineRef.current || !fromRef.current || !toRef.current) return;
    const f = fromRef.current.position;
    const t = toRef.current.position;

    // Compute direction from f → t and offset both endpoints by BLOB_R
    dirVec.subVectors(t, f).normalize();
    const fx = f.x + dirVec.x * BLOB_R;
    const fy = f.y + dirVec.y * BLOB_R;
    const fz = f.z + dirVec.z * BLOB_R;
    const tx = t.x - dirVec.x * BLOB_R;
    const ty = t.y - dirVec.y * BLOB_R;
    const tz = t.z - dirVec.z * BLOB_R;

    lineRef.current.geometry.setPositions([fx, fy, fz, tx, ty, tz]);
  });

  return (
    <Line
      ref={lineRef}
      points={pts}
      color="#a78bfa"
      lineWidth={2}
      dashed
      dashSize={0.14}
      gapSize={0.09}
    />
  );
}

// ── TravellingDot ─────────────────────────────────────────────────────────────
// Single glowing sphere: middle → high → college, looping.
// Travels between blob surfaces (not centres).

function TravellingDot({
  meshRefs,
  count,
}: {
  meshRefs: MeshRef[];
  count: number;
}) {
  const dotRef = useRef<THREE.Mesh>(null!);
  const tRef = useRef(0);
  // Pre-allocated fallback vectors — avoids new objects per frame
  const fallback = useMemo(
    () => BASE_POS.map((p) => new THREE.Vector3(...p)),
    [],
  );
  const dirVec = useMemo(() => new THREE.Vector3(), []);
  const surfA = useMemo(() => new THREE.Vector3(), []);
  const surfB = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!dotRef.current) return;
    tRef.current = (tRef.current + delta / 5) % 1;
    const t = tRef.current;

    const p0 = meshRefs[0].current?.position ?? fallback[0];
    const p1 = meshRefs[1].current?.position ?? fallback[1];
    const p2 = meshRefs[2].current?.position ?? fallback[2];

    if (count >= 3) {
      if (t < 0.5) {
        // Travel from p2 surface → p1 surface
        dirVec.subVectors(p1, p2).normalize();
        surfA.copy(p2).addScaledVector(dirVec, BLOB_R);
        surfB.copy(p1).addScaledVector(dirVec, -BLOB_R);
        dotRef.current.position.lerpVectors(surfA, surfB, t * 2);
      } else {
        // Travel from p1 surface → p0 surface
        dirVec.subVectors(p0, p1).normalize();
        surfA.copy(p1).addScaledVector(dirVec, BLOB_R);
        surfB.copy(p0).addScaledVector(dirVec, -BLOB_R);
        dotRef.current.position.lerpVectors(surfA, surfB, (t - 0.5) * 2);
      }
    } else {
      dirVec.subVectors(p0, p1).normalize();
      surfA.copy(p1).addScaledVector(dirVec, BLOB_R);
      surfB.copy(p0).addScaledVector(dirVec, -BLOB_R);
      dotRef.current.position.lerpVectors(surfA, surfB, t);
    }
  });

  return (
    <mesh ref={dotRef} position={count >= 3 ? BASE_POS[2] : BASE_POS[1]}>
      <sphereGeometry args={[0.09, 12, 12]} />
      <meshStandardMaterial
        color="#a78bfa"
        emissive="#a78bfa"
        emissiveIntensity={6}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────────

function Scene({
  items,
  prefersReduced,
}: {
  items: FlowchartItem[];
  prefersReduced: boolean;
}) {
  const count = Math.min(items.length, 3);

  // Three individual refs — hooks cannot be called in loops
  const mr0 = useRef<THREE.Mesh | null>(null);
  const mr1 = useRef<THREE.Mesh | null>(null);
  const mr2 = useRef<THREE.Mesh | null>(null);
  const meshRefs = useMemo<MeshRef[]>(() => [mr0, mr1, mr2], []);

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 4, 5]} intensity={3.5} color="#a78bfa" />
      <pointLight position={[-3, 1, 4]} intensity={1.5} color="#06b6d4" />

      {items.slice(0, 3).map((edu, i) => (
        <EduBlob
          key={edu._id}
          edu={edu}
          idx={i}
          meshRef={meshRefs[i]}
          prefersReduced={prefersReduced}
        />
      ))}

      {/* Dynamic dashed connectors that stretch as blobs float */}
      {count >= 2 && (
        <StretchingLine
          fromRef={mr0}
          toRef={mr1}
          initFrom={BASE_POS[0]}
          initTo={BASE_POS[1]}
        />
      )}
      {count >= 3 && (
        <StretchingLine
          fromRef={mr1}
          toRef={mr2}
          initFrom={BASE_POS[1]}
          initTo={BASE_POS[2]}
        />
      )}

      {!prefersReduced && count >= 2 && (
        <TravellingDot meshRefs={meshRefs} count={count} />
      )}
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props {
  items: Education[];
}

export function EducationFlowchart({ items }: Props) {
  const sorted: FlowchartItem[] = useMemo(
    () =>
      [...items].sort((a, b) =>
        (b.startDate ?? "").localeCompare(a.startDate ?? ""),
      ),
    [items],
  );

  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    setPrefersReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <div style={{ height: "580px", position: "relative", overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 0.5, 7], fov: 65 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene items={sorted} prefersReduced={prefersReduced} />
      </Canvas>
    </div>
  );
}
