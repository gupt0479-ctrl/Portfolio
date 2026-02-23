"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useInView } from "react-intersection-observer";
import type { PROJECTS_QUERYResult } from "@/sanity/types";

interface ProjectCard3DProps {
  project: PROJECTS_QUERYResult[0];
  index: number;
}

function RotatingGeometry({
  isHovered,
  isMobile,
}: {
  isHovered: boolean;
  isMobile: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x += isHovered ? 0.02 : 0.005;
    meshRef.current.rotation.y += isHovered ? 0.03 : 0.008;

    if (isHovered) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={1}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshPhongMaterial
        color="#6366f1"
        emissive="#4f46e5"
        emissiveIntensity={0.5}
        wireframe={isMobile}
      />
    </mesh>
  );
}

export function ProjectCard3D({ project, index }: ProjectCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { ref: inViewRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <article
      ref={inViewRef}
      className="relative h-64 rounded-2xl border border-white/10 transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas */}
      {!isMobile && (
        <Canvas
          className="absolute inset-0"
          dpr={isHovered ? [1, 1.5] : [1, 1]}
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <RotatingGeometry isHovered={isHovered} isMobile={false} />
        </Canvas>
      )}

      {/* Mobile Fallback */}
      {isMobile && (
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600/20 via-indigo-500/10 to-transparent" />
      )}

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 bg-linear-to-t from-black via-black/60 to-transparent">
        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
        <p className="text-sm text-white/70 mt-2">{project.tagline}</p>

        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech._id}
                className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80"
              >
                {tech.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              Live
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              Code
            </a>
          )}
        </div>
      </div>

      {isHovered && (
        <div className="absolute inset-0 rounded-2xl border border-white/30 pointer-events-none" />
      )}
    </article>
  );
}
