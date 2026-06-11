"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useTypedText } from "./useTypedText";

interface OrbySpeechCloudProps {
  text: string | null;
  visible: boolean;
  positionAbove?: boolean;
  className?: string;
}

const speechCloudVariants = {
  above: {
    initial: { opacity: 0, scale: 0.85, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -4 },
  },
  below: {
    initial: { opacity: 0, scale: 0.85, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 4 },
  },
};

const speechCloudTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export function OrbySpeechCloud({
  text,
  visible,
  positionAbove = true,
  className,
}: OrbySpeechCloudProps) {
  const { displayText, isComplete } = useTypedText(text ?? "", 32, visible);
  const variants = positionAbove
    ? speechCloudVariants.above
    : speechCloudVariants.below;

  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          aria-hidden="true"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={speechCloudTransition}
          className={cn(
            "absolute left-1/2 -translate-x-1/2",
            positionAbove
              ? "bottom-[calc(100%+12px)]"
              : "top-[calc(100%+12px)]",
            "min-w-[200px] max-w-[300px] px-4 py-3",
            "rounded-[12px_12px_12px_4px]",
            "bg-[rgba(10,10,24,0.97)]",
            "border border-[rgba(139,92,246,0.50)]",
            "border-t-[rgba(6,182,212,0.35)]",
            "backdrop-blur-[12px]",
            "shadow-[0_4px_24px_rgba(0,0,0,0.60),0_0_16px_rgba(139,92,246,0.30),0_0_32px_rgba(6,182,212,0.10)]",
            "font-sans text-[13px] font-medium leading-[1.55] text-white/95",
            className,
          )}
        >
          {displayText}
          {!isComplete && (
            <span className="inline-block w-[1px] h-[1em] ml-[1px] align-middle bg-current animate-[blink_0.8s_steps(2)_infinite]" />
          )}
          {positionAbove ? (
            <>
              {/* Tail pointing down (cloud is above Orby) */}
              <div className="absolute -bottom-1.5 left-3 h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[rgba(10,10,24,0.97)]" />
              <div className="absolute -bottom-2.5 left-2 h-0 w-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-[rgba(139,92,246,0.30)]" />
            </>
          ) : (
            <>
              {/* Tail pointing up (cloud is below Orby) */}
              <div className="absolute -top-1.5 left-3 h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[rgba(10,10,24,0.97)]" />
              <div className="absolute -top-2.5 left-2 h-0 w-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-[rgba(139,92,246,0.30)]" />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
