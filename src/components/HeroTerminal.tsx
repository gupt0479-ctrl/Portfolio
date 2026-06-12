"use client";
import { motion } from "motion/react";
import { CometCard } from "@/components/ui/comet-card";

const TERMINAL_LINES = [
  {
    prompt: "$ whoami",
    output: "anant.gupta — AI Engineer & Agentic Systems Builder",
  },
  {
    prompt: "$ stack --top",
    output: "rust · typescript · python · postgres · agents",
  },
  {
    prompt: "$ status",
    output: "shipping → agentic systems · research · product engineering",
  },
];

export function HeroTerminal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative cosmic-drift mx-auto"
    >
      <CometCard variant="dark" rotateDepth={5} translateDepth={8}>
        {/* Terminal window */}
        <div className="cosmic-card rounded-xl p-4 font-mono text-xs max-w-sm">
          {/* Title bar dots */}
          <div className="flex items-center gap-1.5 mb-3">
            <span
              className="w-2.5 h-2.5 rounded-full bg-red-500/70 flex items-center justify-center text-[7px] leading-none text-white/60"
              aria-hidden="true"
            >
              ×
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 flex items-center justify-center text-[7px] leading-none text-white/60"
              aria-hidden="true"
            >
              −
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full bg-green-500/70 flex items-center justify-center text-[7px] leading-none text-white/60"
              aria-hidden="true"
            >
              ⬜
            </span>
            <span className="ml-2 text-white/30 text-[10px]">~/anant</span>
          </div>

          {/* Terminal lines */}
          <div className="space-y-2">
            {TERMINAL_LINES.map((line, i) => (
              <motion.div
                key={line.prompt}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
              >
                <p className="text-cyan-400/70 terminal-glow">{line.prompt}</p>
                <p className="text-white/65 ml-2">{line.output}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </CometCard>
    </motion.div>
  );
}
