"use client";
import { motion } from "motion/react";
import type { Education } from "@/sanity/types";

const BLOB_VARIANTS = ["stable", "forming", "amoeba"] as const;
type BlobVariant = (typeof BLOB_VARIANTS)[number];

const BLOB_SIZES = ["w-44 h-44", "w-36 h-36", "w-28 h-28"] as const;
const BLOB_COLORS = [
  "bg-gradient-to-br from-violet-500/20 to-cyan-500/10",
  "bg-gradient-to-br from-violet-500/15 to-blue-500/8",
  "bg-gradient-to-br from-violet-500/10 to-pink-500/5",
] as const;
const BLOB_ICONS = ["●", "◐", "◌"] as const;

interface FlowchartItem {
  _id: string;
  degree?: string | null;
  institution?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean | null;
  gpa?: string | null;
}

interface Props {
  items: Education[];
}

export function EducationFlowchart({ items }: Props) {
  // Sort real items most-recent-first
  const sorted: FlowchartItem[] = [...items].sort((a, b) =>
    (b.startDate ?? "").localeCompare(a.startDate ?? ""),
  );

  return (
    <div className="flex flex-col items-center gap-0">
      {sorted.map((edu, i) => {
        const variant: BlobVariant = BLOB_VARIANTS[Math.min(i, 2)];
        const size = BLOB_SIZES[Math.min(i, 2)];
        const color = BLOB_COLORS[Math.min(i, 2)];
        const icon = BLOB_ICONS[Math.min(i, 2)];

        return (
          <div key={edu._id}>
            {/* Connector (not before first item) */}
            {i > 0 && <div className="edu-connector mx-auto" aria-hidden />}

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col md:flex-row items-center gap-6"
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
                <span className="text-white/20 text-xs font-mono">{icon}</span>
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
                <p className="text-sm text-white/50 mt-1">
                  {edu.institution ?? "—"}
                </p>
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
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
