"use client";
import { useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Education } from "@/sanity/types";
import { useSpaceFloat } from "@/hooks/use-space-float";

const BLOB_VARIANTS = ["stable", "forming", "amoeba"] as const;
type BlobVariant = (typeof BLOB_VARIANTS)[number];

const BLOB_SIZES = ["w-44 h-44", "w-36 h-36", "w-28 h-28"] as const;
const BLOB_COLORS = [
  "bg-gradient-to-br from-violet-500/20 to-cyan-500/10",
  "bg-gradient-to-br from-violet-500/15 to-blue-500/8",
  "bg-gradient-to-br from-violet-500/10 to-pink-500/5",
] as const;
const BLOB_ICONS = ["●", "◐", "◌"] as const;

const BLOB_CLIP_PATHS = [
  "circle(50%)",
  "ellipse(48% 46% at 52% 50%)",
  "polygon(50% 0%, 90% 20%, 100% 60%, 75% 95%, 30% 100%, 5% 70%, 10% 25%)",
] as const;

// Off-axis horizontal anchors per stage (college, high-school, middle-school)
const X_OFFSETS = [24, -48, 56] as const;

interface FlowchartItem {
  _id: string;
  degree?: string | null;
  institution?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean | null;
  gpa?: string | null;
  description?: string | null;
  logo?: Education["logo"] | null;
}

interface FlowchartNodeProps {
  edu: FlowchartItem;
  stageIndex: number;
  animDelay: number;
}

function FlowchartNode({ edu, stageIndex, animDelay }: FlowchartNodeProps) {
  const { ref, style } = useSpaceFloat();

  const variant: BlobVariant = BLOB_VARIANTS[Math.min(stageIndex, 2)];
  const size = BLOB_SIZES[Math.min(stageIndex, 2)];
  const color = BLOB_COLORS[Math.min(stageIndex, 2)];
  const icon = BLOB_ICONS[Math.min(stageIndex, 2)];
  const xOffset = X_OFFSETS[Math.min(stageIndex, 2)];
  const clipPath = BLOB_CLIP_PATHS[Math.min(stageIndex, 2)];

  return (
    // Outer div holds the static off-axis x-offset via marginLeft.
    // useSpaceFloat owns the transform on motion.div — the two never compete.
    <div style={{ marginLeft: `${xOffset}px` }}>
      <motion.div
        ref={ref as React.RefObject<HTMLDivElement>}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: animDelay }}
        className="flex flex-col md:flex-row items-center gap-6"
        style={style}
      >
        {/* Blob shape */}
        <div
          className={[
            `edu-blob--${variant}`,
            size,
            color,
            "border border-white/10 flex items-center justify-center shrink-0",
          ].join(" ")}
        >
          {edu.logo ? (
            <Image
              src={urlFor(edu.logo).width(96).height(96).url()}
              alt={
                edu.institution ? `${edu.institution} logo` : "Institution logo"
              }
              width={48}
              height={48}
              className="size-12 object-contain"
              style={{ clipPath }}
            />
          ) : (
            <span className="text-white/20 text-xs font-mono">{icon}</span>
          )}
        </div>

        {/* Text panel */}
        <div className="cosmic-card rounded-xl p-4 max-w-xs text-left">
          <h3 className="text-base font-display font-semibold text-white">
            {edu.degree ?? "—"}
          </h3>
          {edu.fieldOfStudy && (
            <p className="text-sm text-white/60 mt-0.5">
              in {edu.fieldOfStudy}
            </p>
          )}
          <p className="text-sm text-white/50 mt-1">{edu.institution ?? "—"}</p>
          <p className="text-xs text-white/35 mt-1 font-mono">
            {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} —{" "}
            {edu.current
              ? "Present"
              : edu.endDate
                ? new Date(edu.endDate).getFullYear()
                : ""}
          </p>
          {edu.gpa && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/15 text-xs text-white/70">
              GPA: {edu.gpa}
            </span>
          )}
          {edu.description && (
            <p className="text-xs text-white/45 mt-2 font-sans leading-relaxed line-clamp-3">
              {edu.description}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function PulseConnector({ index }: { index: number }) {
  const delay = `${(index - 1) * 1.5}s`;
  return (
    <div
      className="relative mx-auto my-1"
      style={{ width: "2px", height: "72px" }}
      aria-hidden
    >
      {/* Dotted static track */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(167,139,250,0.22) 0px, rgba(167,139,250,0.22) 3px, transparent 3px, transparent 9px)",
        }}
      />
      {/* Traveling glow dot */}
      <div
        className="edu-pulse-dot absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: "7px",
          height: "7px",
          background: "rgba(167,139,250,0.9)",
          boxShadow:
            "0 0 8px rgba(167,139,250,0.75), 0 0 18px rgba(167,139,250,0.3)",
          animationName: "edu-pulse-travel",
          animationDuration: "2.6s",
          animationTimingFunction: "ease-in-out",
          animationDelay: delay,
          animationIterationCount: "infinite",
        }}
      />
    </div>
  );
}

interface Props {
  items: Education[];
}

export function EducationFlowchart({ items }: Props) {
  const sorted: FlowchartItem[] = [...items].sort((a, b) =>
    (b.startDate ?? "").localeCompare(a.startDate ?? ""),
  );

  return (
    <div className="flex flex-col items-center gap-0">
      {sorted.map((edu, i) => (
        <div key={edu._id}>
          {i > 0 && <PulseConnector index={i} />}
          <FlowchartNode edu={edu} stageIndex={i} animDelay={i * 0.15} />
        </div>
      ))}
    </div>
  );
}
