"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function Field() {
  const group = useRef<THREE.Group>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const smooth = useRef(new THREE.Vector2(0, 0));

  const items = useMemo(() => {
    const geos = [
      new THREE.IcosahedronGeometry(1.15, 0),
      new THREE.DodecahedronGeometry(1.05, 0),
      new THREE.OctahedronGeometry(1.0, 0),
      new THREE.TorusGeometry(0.85, 0.28, 24, 64),
      new THREE.BoxGeometry(1.1, 1.1, 1.1),
    ];

    const colors = [
      "#7C3AED",
      "#38BDF8",
      "#22C55E",
      "#F97316",
      "#E879F9",
      "#60A5FA",
    ];

    return Array.from({ length: 8 }).map((_, i) => {
      const geo = geos[i % geos.length];
      const color = new THREE.Color(colors[i % colors.length]);
      const pos = new THREE.Vector3(
        THREE.MathUtils.randFloat(-3.9, 3.9),
        THREE.MathUtils.randFloat(0.2, 2.9),
        THREE.MathUtils.randFloat(-7.5, -2.2),
      );
      const rot = new THREE.Euler(
        THREE.MathUtils.randFloat(0, Math.PI),
        THREE.MathUtils.randFloat(0, Math.PI),
        THREE.MathUtils.randFloat(0, Math.PI),
      );
      const scale = THREE.MathUtils.randFloat(0.75, 1.35);
      const speed = THREE.MathUtils.randFloat(0.65, 1.25);
      return { id: `h-${i}`, geo, color, pos, rot, scale, speed };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    smooth.current.x = lerp(smooth.current.x, mouse.current.x, 0.06);
    smooth.current.y = lerp(smooth.current.y, mouse.current.y, 0.06);

    if (group.current) {
      group.current.rotation.y = t * 0.08 + smooth.current.x * 0.2;
      group.current.rotation.x =
        Math.sin(t * 0.12) * 0.06 - smooth.current.y * 0.14;
      group.current.position.x = smooth.current.x * 0.35;
      group.current.position.y = smooth.current.y * 0.2;
    }
  });

  return (
    <>
      <group
        ref={group}
        onPointerMove={(e) => {
          mouse.current.set((e.point.x / 4) * 0.8, (e.point.y / 3) * 0.8);
        }}
      >
        {items.map((it) => (
          <mesh
            key={it.id}
            geometry={it.geo}
            position={it.pos}
            rotation={it.rot}
            scale={it.scale}
          >
            <meshStandardMaterial
              color={it.color}
              metalness={0.75}
              roughness={0.22}
              emissive={it.color}
              emissiveIntensity={0.22}
            />
          </mesh>
        ))}
      </group>
      <fog attach="fog" args={["#000000", 6, 12]} />
    </>
  );
}

export default function Hero3DBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.2, 7.2], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[7, 6, 6]} intensity={1.25} />
        <directionalLight position={[-6, -2, 3]} intensity={0.55} />
        <Field />
        <Environment preset="city" />
      </Canvas>

      <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/25 to-black/85" />
      <div className="absolute inset-0 mask-[radial-gradient(circle_at_30%_30%,black,transparent_65%)] bg-black/35" />
    </div>
  );
}
