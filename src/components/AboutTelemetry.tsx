"use client";

import { Cpu, Layers, Microscope, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { CometCard } from "@/components/ui/comet-card";

// Stats are rendered directly from Sanity `profile.stats[]` in order (label + value
// verbatim). Icons are picked by index from this ring — no keyword matching, no
// canonical fixed slots, no hardcoded fallbacks. Populate stats in Studio.
const STAT_ICONS = [Layers, Cpu, TrendingUp, Microscope] as const;

// Sparkline heights — gives a "trending up" shape
const SPARKLINE_BARS = [
  { id: "baseline", height: 2 },
  { id: "lift", height: 3 },
  { id: "dip", height: 2 },
  { id: "climb", height: 4 },
  { id: "peak", height: 5 },
];

interface TelemetryCardProps {
  label: string;
  value: string;
  Icon: React.FC<{ className?: string }>;
  index: number;
}

function TelemetryCard({ label, value, Icon, index }: TelemetryCardProps) {
  return (
    <CometCard variant="subtle" rotateDepth={4} translateDepth={6}>
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
          {SPARKLINE_BARS.map((bar, i) => (
            <span
              key={bar.id}
              className="inline-block w-1 rounded-sm bg-violet-400/35 group-hover:bg-violet-400/75 transition-colors duration-300"
              style={{
                height: `${bar.height * 2}px`,
                animation: `sparkline-rise 1.2s ease-out ${i * 0.1}s both`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </CometCard>
  );
}

export function AboutTelemetry({
  stats,
}: {
  stats: { label?: string; value?: string }[];
}) {
  const items = (stats ?? [])
    .filter((s) => (s.value ?? "").trim().length > 0)
    .slice(0, 4);

  if (!items.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {items.map((stat, i) => (
        <TelemetryCard
          key={`${stat.label ?? "stat"}-${i}`}
          label={stat.label ?? ""}
          value={stat.value ?? ""}
          Icon={
            STAT_ICONS[i % STAT_ICONS.length] as React.FC<{
              className?: string;
            }>
          }
          index={i}
        />
      ))}
    </div>
  );
}
