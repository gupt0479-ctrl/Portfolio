/** biome-ignore-all assist/source/organizeImports: false positive */
"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function useMouseParallax(strength = 0.16) {
  const target = useRef(new THREE.Vector2(0, 0));
  const current = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      target.current.set(x, y);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    current.current.x = lerp(current.current.x, target.current.x, 0.05);
    current.current.y = lerp(current.current.y, target.current.y, 0.05);
  });

  return {
    x: current.current.x * viewport.width * 0.5 * strength,
    y: -current.current.y * viewport.height * 0.5 * strength,
  };
}

type ShapeSpec = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  kind: "box" | "sphere" | "torus" | "octa";
  speed: number;
  color: string;
};

function Shape({ spec }: { spec: ShapeSpec }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = spec.rotation[0] + t * 0.14 * spec.speed;
    ref.current.rotation.y = spec.rotation[1] + t * 0.18 * spec.speed;
    ref.current.position.y =
      spec.position[1] +
      Math.sin(t * (0.75 * spec.speed) + spec.position[0]) * 0.32;
    ref.current.position.x =
      spec.position[0] +
      Math.cos(t * (0.55 * spec.speed) + spec.position[2]) * 0.22;
    ref.current.position.z =
      spec.position[2] + Math.sin(t * (0.45 * spec.speed)) * 0.18;
  });

  const geometry = useMemo(() => {
    switch (spec.kind) {
      case "box":
        return new THREE.BoxGeometry(1, 1, 1);
      case "sphere":
        return new THREE.SphereGeometry(0.65, 32, 32);
      case "torus":
        return new THREE.TorusGeometry(0.7, 0.25, 24, 64);
      case "octa":
        return new THREE.OctahedronGeometry(0.85, 0);
    }
  }, [spec.kind]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: spec.color,
        metalness: 0.7,
        roughness: 0.24,
        emissive: new THREE.Color(spec.color).multiplyScalar(0.12),
      }),
    [spec.color],
  );

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      position={spec.position}
      rotation={spec.rotation}
      scale={spec.scale}
    />
  );
}

function ShapesField() {
  const parallax = useMouseParallax(0.16);

  const specs: ShapeSpec[] = useMemo(
    () => [
      {
        kind: "torus",
        position: [-2.2, 1.2, -3.2],
        rotation: [0.2, 0.6, 0.1],
        scale: 1.25,
        speed: 1.1,
        color: "#7C3AED",
      },
      {
        kind: "octa",
        position: [2.2, 1.6, -3.9],
        rotation: [0.4, 0.1, 0.2],
        scale: 1.05,
        speed: 0.9,
        color: "#22C55E",
      },
      {
        kind: "box",
        position: [0.4, 0.2, -2.8],
        rotation: [0.1, 0.2, 0.3],
        scale: 0.95,
        speed: 1.0,
        color: "#38BDF8",
      },
      {
        kind: "sphere",
        position: [-0.3, 2.1, -4.6],
        rotation: [0.0, 0.4, 0.0],
        scale: 0.9,
        speed: 0.8,
        color: "#F97316",
      },
      {
        kind: "box",
        position: [1.5, -0.6, -4.2],
        rotation: [0.3, 0.7, 0.2],
        scale: 0.8,
        speed: 1.25,
        color: "#E879F9",
      },
      {
        kind: "octa",
        position: [-1.3, -0.9, -5.1],
        rotation: [0.6, 0.2, 0.1],
        scale: 0.75,
        speed: 1.05,
        color: "#60A5FA",
      },
    ],
    [],
  );

  return (
    <group position={[parallax.x, parallax.y + 0.25, 0]}>
      {specs.map((s) => (
        <Shape key={`${s.kind}-${s.position.join("-")}`} spec={s} />
      ))}
    </group>
  );
}

export function FloatingShapesBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.8, 4.7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.28} />
        <directionalLight position={[3, 4, 3]} intensity={1.15} />
        <directionalLight position={[-4, -2, 2]} intensity={0.55} />
        <ShapesField />
        <Environment preset="city" />
        <fog attach="fog" args={["#000000", 5.5, 11]} />
      </Canvas>
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/20 to-black/80" />
      <div className="absolute inset-0 mask-[radial-gradient(circle_at_35%_30%,black,transparent_65%)] bg-black/30" />
    </div>
  );
}
