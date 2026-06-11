"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface OrbyModelProps {
  className?: string;
  pose?: "idle" | "wave" | "pointing";
  speaking?: boolean;
}

export function OrbyModel({
  className,
  pose = "idle",
  speaking = false,
}: OrbyModelProps) {
  const getRightArmStyle = (): React.CSSProperties => {
    if (speaking) {
      return {
        transform: "rotate(-30deg) translateY(-4px)",
        transformOrigin: "top center",
        transition: "transform 300ms ease",
      };
    }
    if (pose === "pointing") {
      return {
        transform: "rotate(-45deg)",
        transformOrigin: "top center",
        transition: "transform 300ms ease",
      };
    }
    return {
      transformOrigin: "top center",
      transition: "transform 300ms ease",
    };
  };

  const astronautContent = (
    <div className="relative flex flex-col items-center">
      {/* Helmet */}
      <div
        className="relative"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: "2px solid rgba(139, 92, 246, 0.55)",
          boxShadow:
            "0 0 12px rgba(139, 92, 246, 0.5), 0 0 24px rgba(139, 92, 246, 0.2), 0 0 8px rgba(6, 182, 212, 0.25), inset 0 -4px 8px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Visor */}
        <div
          className="overflow-hidden"
          style={{
            width: 24,
            height: 16,
            borderRadius: "12px 12px 8px 8px",
            background:
              "linear-gradient(180deg, #22d3ee 0%, #06b6d4 40%, #0e7490 100%)",
            boxShadow:
              "inset 0 2px 6px rgba(255, 255, 255, 0.45), 0 0 10px rgba(6, 182, 212, 0.7), 0 0 20px rgba(6, 182, 212, 0.35)",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -40%)",
          }}
        >
          {/* Visor glint (static dot) */}
          <div
            style={{
              width: 6,
              height: 4,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.6)",
              position: "absolute",
              top: 3,
              right: 4,
            }}
          />
          {/* Helmet glint sweep */}
          <div
            className="orby-glint-sweep"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Body with backpack and arms */}
      <div className="relative flex items-start">
        {/* Left arm */}
        <div
          style={{
            width: 8,
            height: 20,
            borderRadius: 4,
            background: "linear-gradient(180deg, #cbd5e1 0%, #64748b 100%)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            marginTop: 4,
            marginRight: -2,
          }}
        />

        {/* Body */}
        <div
          className="relative"
          style={{
            width: 28,
            height: 32,
            borderRadius: 10,
            background: "linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)",
            border: "1.5px solid rgba(139, 92, 246, 0.3)",
            boxShadow:
              "0 0 6px rgba(139, 92, 246, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Backpack (behind body) */}
          <div
            style={{
              width: 14,
              height: 20,
              borderRadius: 4,
              background: "linear-gradient(180deg, #374151 0%, #1f2937 100%)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              boxShadow: "0 0 4px rgba(6, 182, 212, 0.2)",
              position: "absolute",
              top: 4,
              left: -8,
              zIndex: -1,
            }}
          />
        </div>

        {/* Right arm (holds radio, animated for wave/pointing) */}
        <motion.div
          className="relative"
          style={{
            width: 8,
            height: 20,
            borderRadius: 4,
            background: "linear-gradient(180deg, #cbd5e1 0%, #64748b 100%)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            marginTop: 4,
            marginLeft: -2,
            ...getRightArmStyle(),
          }}
          animate={
            pose === "wave" ? { rotate: [0, -25, 0, -25, 0] } : undefined
          }
          transition={
            pose === "wave" ? { duration: 1.2, ease: "easeInOut" } : undefined
          }
        >
          {/* Radio */}
          <div
            style={{
              width: 6,
              height: 10,
              borderRadius: 2,
              background: "linear-gradient(180deg, #4c1d95 0%, #7c3aed 100%)",
              boxShadow: "0 0 4px rgba(139, 92, 246, 0.5)",
              position: "absolute",
              top: -2,
              right: -2,
            }}
          />
        </motion.div>
      </div>

      {/* Legs */}
      <div className="flex gap-[4px]">
        {/* Left leg */}
        <div
          style={{
            width: 8,
            height: 14,
            borderRadius: "4px 4px 3px 3px",
            background: "linear-gradient(180deg, #94a3b8 0%, #475569 100%)",
            border: "1px solid rgba(139, 92, 246, 0.15)",
          }}
        />
        {/* Right leg */}
        <div
          style={{
            width: 8,
            height: 14,
            borderRadius: "4px 4px 3px 3px",
            background: "linear-gradient(180deg, #94a3b8 0%, #475569 100%)",
            border: "1px solid rgba(139, 92, 246, 0.15)",
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      aria-hidden="true"
      data-pose={pose}
      className={cn("orby-wrapper relative", className)}
    >
      {/* Glow aura */}
      <div
        className="pointer-events-none absolute inset-[-8px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)",
        }}
      />

      {/* Idle float + micro-rotation wrapper (only animates when pose is idle) */}
      {pose === "idle" ? (
        <motion.div
          animate={{
            y: [0, -6, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            y: {
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {astronautContent}
        </motion.div>
      ) : (
        astronautContent
      )}

      {/* Glint sweep keyframes */}
      <style jsx>{`
        @keyframes orby-glint {
          0% {
            transform: translateX(-100%);
            opacity: 1;
          }
          37.5% {
            transform: translateX(100%);
            opacity: 1;
          }
          37.6% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
        .orby-glint-sweep {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          animation: orby-glint 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
