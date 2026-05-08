"use client";

import { motion } from "motion/react";
import { Cpu, Layers, Microscope, TrendingUp } from "lucide-react";

// Canonical four readouts — labels match what the spec asks for.
// If Sanity stats have matching labels (case-insensitive), those values are used.
// Otherwise the component falls back to yearsOfExperience / hardcoded defaults.
const CANONICAL_READOUTS = [
  {
    label: "Projects Built",
    defaultValue: "10+",
    Icon: Layers,
    matchTerms: ["project"],
  },
  {
    label: "Technologies",
    defaultValue: "20+",
    Icon: Cpu,
    matchTerms: ["tech", "language", "tool", "stack"],
  },
  {
    label: "Currently Learning",
    defaultValue: "Rust · LLMs",
    Icon: TrendingUp,
    matchTerms: ["learn", "studying", "current"],
  },
  {
    label: "Research Focus",
    defaultValue: "AI Systems",
    Icon: Microscope,
    matchTerms: ["research", "focus", "interest"],
  },
] as const;

type CanonicalReadout = typeof CANONICAL_READOUTS[number];

/** Find the best matching stat from Sanity for a canonical readout. */
function findStat(
  stats: { label?: string; value?: string }[],
  readout: CanonicalReadout,
): string | null {
  const lower = (s: string | undefined) => (s ?? "").toLowerCase();
  const match = stats.find((s) =>
    readout.matchTerms.some((term) => lower(s.label).includes(term)),
  );
  return match?.value ?? null;
}

// Sparkline heights — gives a "trending up" shape
const SPARKLINE_HEIGHTS = [2, 3, 2, 4, 5];

interface TelemetryCardProps {
  label: string;
  value: string;
  Icon: React.FC<{ className?: string }>;
  index: number;
}

function TelemetryCard({ label, value, Icon, index }: TelemetryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="cosmic-card rounded-xl p-4 group hover:border-[rgba(167,139,250,0.35)] transition-colors"
    >
      <Icon className="size-4 text-violet-400/60 mb-2" />
      <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">
        {value}
      </p>
      <p className="text-xs text-white/40 mt-1 font-sans">{label}</p>
      {/* Animated sparkline — ascending bars that pulse on hover */}
      <div className="mt-2 flex items-end gap-0.5">
        {SPARKLINE_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className="inline-block w-1 rounded-sm bg-violet-400/35 group-hover:bg-violet-400/75 transition-colors duration-300"
            style={{
              height: `${h * 2}px`,
              animation: `sparkline-rise 1.2s ease-out ${i * 0.1}s both`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function AboutTelemetry({
  stats,
}: {
  stats: { label?: string; value?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {CANONICAL_READOUTS.map((readout, i) => {
        const value = findStat(stats, readout) ?? readout.defaultValue;
        return (
          <TelemetryCard
            key={readout.label}
            label={readout.label}
            value={value}
            Icon={readout.Icon as React.FC<{ className?: string }>}
            index={i}
          />
        );
      })}
    </div>
  );
}
