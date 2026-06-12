"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { OrbyCanvas } from "@/components/orby/OrbyCanvas";
import { cn } from "@/lib/utils";

type PanelOrbyState = "idle" | "thinking" | "responding";

interface PanelOrbyProps {
  state: PanelOrbyState;
  responseText?: string;
  isWaving?: boolean;
  onWaveComplete?: () => void;
  copyConfirmation?: boolean;
}

export function PanelOrby({
  state,
  responseText,
  isWaving,
  onWaveComplete,
  copyConfirmation,
}: PanelOrbyProps) {
  const pose = isWaving ? "wave" : "idle";

  // Fire onWaveComplete after 1500ms when waving starts
  useEffect(() => {
    if (!isWaving) return;
    const timer = setTimeout(() => {
      onWaveComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [isWaving, onWaveComplete]);

  return (
    <div
      aria-hidden="true"
      className="relative flex flex-col items-center py-4"
    >
      {/* Orby model with state-based wrapper animations */}
      <motion.div
        animate={
          isWaving
            ? { y: [0, -4, 0], x: [0, 2, 0] }
            : state === "idle"
              ? { y: [0, -4, 0], x: [0, 3, 0] }
              : state === "thinking"
                ? { x: [0, 12, 12], y: [0, -2, 0] }
                : { y: [0, -2, 0] }
        }
        transition={
          isWaving
            ? {
                y: { duration: 1.5, ease: "easeInOut" },
                x: { duration: 2, ease: "easeInOut" },
              }
            : state === "idle"
              ? {
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }
              : state === "thinking"
                ? {
                    x: { duration: 0.6, ease: "easeOut" },
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }
                : {
                    y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                  }
        }
      >
        <OrbyCanvas
          pose={pose}
          speaking={state === "responding" && !isWaving}
          size={72}
        />
      </motion.div>

      {/* Speech cloud area */}
      <div className="relative mt-3 min-h-[48px] w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {copyConfirmation && !isWaving && (
            <motion.div
              key="copy-cloud"
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "max-w-[220px] px-3 py-2 rounded-xl",
                "bg-[rgba(15,15,30,0.92)]",
                "border border-[rgba(139,92,246,0.3)]",
                "backdrop-blur-[8px]",
                "shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_8px_rgba(139,92,246,0.15)]",
                "font-sans text-[11px] leading-[1.4] text-[rgba(255,255,255,0.85)] text-center",
              )}
            >
              Prompt copied — paste it in the chat box ↓
            </motion.div>
          )}

          {!copyConfirmation && !isWaving && state === "thinking" && (
            <motion.div
              key="thinking-cloud"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1, 0.95] }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              }}
              className={cn(
                "px-3 py-2 rounded-xl",
                "bg-[rgba(15,15,30,0.92)]",
                "border border-[rgba(139,92,246,0.3)]",
                "backdrop-blur-[8px]",
                "shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_8px_rgba(139,92,246,0.15)]",
                "text-[11px] leading-[1.4] text-[rgba(255,255,255,0.6)]",
              )}
            >
              <span className="inline-flex gap-0.5">
                <span className="animate-pulse">•</span>
                <span className="animate-pulse [animation-delay:200ms]">•</span>
                <span className="animate-pulse [animation-delay:400ms]">•</span>
              </span>
            </motion.div>
          )}

          {!copyConfirmation && !isWaving && state === "responding" && (
            <motion.div
              key="responding-cloud"
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "max-w-[220px] px-3 py-2 rounded-xl",
                "bg-[rgba(15,15,30,0.92)]",
                "border border-[rgba(139,92,246,0.3)]",
                "backdrop-blur-[8px]",
                "shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_8px_rgba(139,92,246,0.15)]",
                "font-sans text-[11px] leading-[1.4] text-[rgba(255,255,255,0.85)]",
              )}
            >
              {responseText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
