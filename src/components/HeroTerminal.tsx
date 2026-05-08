"use client";
import { motion } from "motion/react";

const TERMINAL_LINES = [
  { prompt: "$ whoami", output: "anant.gupta — ai & data systems engineer" },
  { prompt: "$ stack --top", output: "rust · typescript · python · postgres · llms" },
  { prompt: "$ status", output: "shipping → research/agents · ui/ux · data pipelines" },
];

const ORBITING_CHIPS = ["Next.js", "Rust", "LLMs"];

export function HeroTerminal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative"
    >
      {/* Terminal window */}
      <div className="cosmic-card rounded-xl p-4 font-mono text-xs max-w-sm">
        {/* Title bar dots */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
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
              <p className="text-cyan-400/70">{line.prompt}</p>
              <p className="text-white/65 ml-2">{line.output}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Orbiting chips */}
      <div className="absolute -top-3 -right-3 flex gap-1.5">
        {ORBITING_CHIPS.map((chip, i) => (
          <motion.span
            key={chip}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 + i * 0.1 }}
            className="orbit-chip text-[10px]"
          >
            {chip}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
