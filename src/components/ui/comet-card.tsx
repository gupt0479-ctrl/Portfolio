"use client";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type React from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type CometCardVariant = "default" | "dark" | "subtle";

export const CometCard = ({
  rotateDepth = 17.5,
  translateDepth = 20,
  variant = "default",
  className,
  children,
}: {
  rotateDepth?: number;
  translateDepth?: number;
  variant?: CometCardVariant;
  className?: string;
  children: React.ReactNode;
}) => {
  // Subtle variant caps rotateDepth at 6
  const effectiveRotateDepth = variant === "subtle" ? Math.min(rotateDepth, 6) : rotateDepth;
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${effectiveRotateDepth}deg`, `${effectiveRotateDepth}deg`],
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${effectiveRotateDepth}deg`, `-${effectiveRotateDepth}deg`],
  );

  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`],
  );
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`],
  );

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);

  const glareBackground = useMotionTemplate`radial-gradient(
  circle at ${glareX}% ${glareY}%,
  hsla(280, 90%, 75%, 0.13) 0%,
  hsla(220, 85%, 70%, 0.11) 20%,
  hsla(160, 80%, 65%, 0.09) 40%,
  hsla(60, 85%, 70%, 0.07) 60%,
  transparent 80%
)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Variant-based config
  const variantClass = variant === "dark" ? "cosmic-card--dark" : variant === "subtle" ? "cosmic-card--subtle" : "cosmic-card";
  const glareOpacity = variant === "dark" ? 0.35 : variant === "subtle" ? 0.25 : 0.5;
  const hoverScale = variant === "default" ? 1.05 : 1.02;

  return (
    <div className={cn("perspective-distant transform-3d", className)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          boxShadow:
            "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px, rgba(0, 0, 0, 0.08) 0px 10px 15px 0px, rgba(0, 0, 0, 0.12) 0px 15px 25px 0px",
        }}
        initial={{ scale: 1, z: 0 }}
        whileHover={{
          scale: hoverScale,
          z: 50,
          transition: { duration: 0.2 },
        }}
        className={cn("relative rounded-2xl", variantClass)}
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 h-full w-full rounded-[16px] mix-blend-overlay"
          style={{
            background: glareBackground,
            opacity: glareOpacity,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </div>
  );
};
