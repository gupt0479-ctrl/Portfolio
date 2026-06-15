"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface AstronautProps {
  pose: "idle" | "wave" | "pointing";
  speaking: boolean;
  reducedMotion: boolean;
}

function AstronautBody({ pose, speaking, reducedMotion }: AstronautProps) {
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const waveStartRef = useRef<number>(0);
  const prevPoseRef = useRef<string>("");

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;

    // Reset wave start time when transitioning into wave pose
    if (pose === "wave" && prevPoseRef.current !== "wave") {
      waveStartRef.current = t;
    }
    prevPoseRef.current = pose;

    // ── Arm animations ──────────────────────────────────────────────────────
    if (pose === "wave") {
      const localT = t - waveStartRef.current;
      const decay = Math.exp(-localT * 0.3);

      if (rightArmRef.current) {
        // Raise arm well above the shoulder (-2.1 rad ≈ 120° CW from rest/down position)
        // Damped oscillation: energetic start that settles naturally
        const waveTargetZ = -2.1 + Math.sin(localT * 2.5) * decay * 0.4;
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          waveTargetZ,
          0.1,
        );
        rightArmRef.current.rotation.x = Math.cos(localT * 2.0) * decay * 0.2;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z =
          Math.sin(localT * 1.1 + 0.8) * decay * 0.18;
        leftArmRef.current.rotation.x = 0;
      }
    } else if (pose === "pointing") {
      // Extend right arm outward toward the lab button (positive z = viewer's right)
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          0.65,
          0.07,
        );
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          0.28,
          0.07,
        );
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = Math.sin(t * 0.7 + 1.0) * 0.12;
        leftArmRef.current.rotation.x = 0;
      }
    } else if (speaking) {
      // Expressive gesturing while talking
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = Math.sin(t * 3.1) * 0.45 - 0.1;
        rightArmRef.current.rotation.x = Math.sin(t * 2.0) * 0.25;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = Math.sin(t * 2.4 + 1.2) * 0.35;
        leftArmRef.current.rotation.x = Math.sin(t * 1.7 + 0.5) * 0.18;
      }
    } else {
      // Idle — arms drift in microgravity at different frequencies
      const targetRightZ = Math.sin(t * 0.82 + 0.3) * 0.28;
      const targetRightX = Math.sin(t * 1.15) * 0.15;
      const targetLeftZ = Math.sin(t * 0.95 + 1.7) * 0.22;
      const targetLeftX = Math.sin(t * 1.35 + 0.9) * 0.12;

      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          targetRightZ,
          0.05,
        );
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          targetRightX,
          0.05,
        );
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.z,
          targetLeftZ,
          0.05,
        );
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          targetLeftX,
          0.05,
        );
      }
    }

    // ── Legs — gentle float-walk, much subtler than arms ───────────────────
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(t * 1.1 + Math.PI) * 0.09;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = Math.sin(t * 1.1) * 0.09;
    }
  });

  return (
    <group>
      {/* ── Helmet glow corona ── */}
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.52, 16, 16]} />
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.16}
          emissive="#8b5cf6"
          emissiveIntensity={1.4}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ── Helmet — dark metallic sphere (bigger than body) ── */}
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.75}
          roughness={0.25}
          emissive="#0a0a1a"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* ── Helmet violet rim ring ── */}
      <mesh position={[0, 0.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.39, 0.028, 8, 40]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={1.1}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>

      {/* ── Visor — cyan reflective dome ── */}
      <mesh position={[0, 0.62, 0.3]} rotation={[-0.2, 0, 0]}>
        <sphereGeometry
          args={[0.28, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]}
        />
        <meshStandardMaterial
          color="#06b6d4"
          metalness={0.92}
          roughness={0.04}
          transparent
          opacity={0.95}
          emissive="#0891b2"
          emissiveIntensity={0.7}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* ── Visor glint ── */}
      <mesh position={[0.1, 0.7, 0.44]}>
        <sphereGeometry args={[0.028, 6, 6]} />
        <meshStandardMaterial
          color="white"
          emissive="white"
          emissiveIntensity={1.6}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* ── Smile — tiny flat white bar below visor center ── */}
      <mesh position={[0, 0.5, 0.41]}>
        <boxGeometry args={[0.1, 0.018, 0.01]} />
        <meshStandardMaterial
          color="white"
          emissive="white"
          emissiveIntensity={1.2}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* ── Body — narrower torso to emphasise big head ── */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.38, 0.44, 0.26]} />
        <meshStandardMaterial
          color="#c8d0de"
          metalness={0.1}
          roughness={0.65}
          emissive="#0a0a1a"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* ── Backpack ── */}
      <mesh position={[0, 0.08, -0.19]}>
        <boxGeometry args={[0.22, 0.3, 0.09]} />
        <meshStandardMaterial
          color="#1f2937"
          metalness={0.35}
          roughness={0.55}
          emissive="#06b6d4"
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* ── Left arm — tiny, shoulder pivot ── */}
      <group ref={leftArmRef} position={[-0.27, 0.15, 0]}>
        <mesh position={[0, -0.09, 0]}>
          <capsuleGeometry args={[0.038, 0.14, 4, 8]} />
          <meshStandardMaterial
            color="#b0bcc9"
            metalness={0.14}
            roughness={0.68}
          />
        </mesh>
      </group>

      {/* ── Right arm — tiny, shoulder pivot, holds radio ── */}
      <group ref={rightArmRef} position={[0.27, 0.15, 0]}>
        <mesh position={[0, -0.09, 0]}>
          <capsuleGeometry args={[0.038, 0.14, 4, 8]} />
          <meshStandardMaterial
            color="#b0bcc9"
            metalness={0.14}
            roughness={0.68}
          />
        </mesh>
        {/* Radio */}
        <mesh position={[0.04, -0.19, 0.05]}>
          <boxGeometry args={[0.065, 0.09, 0.045]} />
          <meshStandardMaterial
            color="#4c1d95"
            emissive="#7c3aed"
            emissiveIntensity={1.0}
          />
        </mesh>
      </group>

      {/* ── Left leg — hip pivot ── */}
      <group ref={leftLegRef} position={[-0.1, -0.24, 0]}>
        <mesh position={[0, -0.155, 0]}>
          <capsuleGeometry args={[0.068, 0.2, 4, 8]} />
          <meshStandardMaterial
            color="#8899ab"
            metalness={0.1}
            roughness={0.73}
          />
        </mesh>
        <mesh position={[0, -0.31, 0.03]}>
          <boxGeometry args={[0.1, 0.06, 0.14]} />
          <meshStandardMaterial
            color="#374151"
            metalness={0.2}
            roughness={0.65}
          />
        </mesh>
      </group>

      {/* ── Right leg — opposite phase ── */}
      <group ref={rightLegRef} position={[0.1, -0.24, 0]}>
        <mesh position={[0, -0.155, 0]}>
          <capsuleGeometry args={[0.068, 0.2, 4, 8]} />
          <meshStandardMaterial
            color="#8899ab"
            metalness={0.1}
            roughness={0.73}
          />
        </mesh>
        <mesh position={[0, -0.31, 0.03]}>
          <boxGeometry args={[0.1, 0.06, 0.14]} />
          <meshStandardMaterial
            color="#374151"
            metalness={0.2}
            roughness={0.65}
          />
        </mesh>
      </group>
    </group>
  );
}

interface SceneProps {
  pose: "idle" | "wave" | "pointing";
  speaking: boolean;
  reducedMotion: boolean;
}

function AstronautScene({ pose, speaking, reducedMotion }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[1, 2, 2]} intensity={1.3} color="#ffffff" />
      {/* Violet sky, cyan ground — space colour fill */}
      <hemisphereLight args={["#8b5cf6", "#06b6d4", 0.4]} />
      {/* Violet rim top-right */}
      <pointLight
        position={[2, 3, 3]}
        color="#8b5cf6"
        intensity={4.0}
        decay={2}
      />
      {/* Cyan fill left */}
      <pointLight
        position={[-2, 1, 2]}
        color="#06b6d4"
        intensity={2.5}
        decay={2}
      />
      {/* Soft white bounce from below */}
      <pointLight
        position={[0, -1, 2]}
        color="#ffffff"
        intensity={0.7}
        decay={2}
      />

      <AstronautBody
        pose={pose}
        speaking={speaking}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

export interface OrbyCanvasProps {
  pose?: "idle" | "wave" | "pointing";
  speaking?: boolean;
  size?: number;
}

export function OrbyCanvas({
  pose = "idle",
  speaking = false,
  size = 88,
}: OrbyCanvasProps) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const height = Math.round(size * 1.3);

  return (
    <Canvas
      style={{
        width: size,
        height,
        background: "transparent",
        display: "block",
        overflow: "visible",
      }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 3.2], fov: 38 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.8 }}
    >
      <AstronautScene
        pose={pose}
        speaking={speaking}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
