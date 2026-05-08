"use client";

import { MapPin } from "lucide-react";
import { CometCard } from "@/components/ui/comet-card";
import type { EXPERIENCE_QUERYResult } from "@/sanity/types";

type Experience = EXPERIENCE_QUERYResult[0];

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "rgba(143, 124, 247, 0.7)",
  backend: "rgba(96, 165, 250, 0.7)",
  "ai-ml": "rgba(52, 211, 153, 0.7)",
  devops: "rgba(244, 114, 182, 0.7)",
  database: "rgba(251, 146, 60, 0.7)",
  cloud: "rgba(56, 189, 248, 0.7)",
  tools: "rgba(250, 204, 21, 0.7)",
  "soft-skills": "rgba(148, 163, 184, 0.7)",
};

function getCategoryColor(category?: string | null): string {
  return CATEGORY_COLORS[category ?? ""] ?? "rgba(167, 139, 250, 0.7)";
}

interface ExperienceCardProps {
  experience: Experience;
  index: number;
}

export function ExperienceCard({ experience, index }: ExperienceCardProps) {
  const responsibilities = (experience.responsibilities ?? [])
    .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
    .slice(0, 3);

  return (
    <div
      className="group"
      style={{
        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      <CometCard rotateDepth={3} translateDepth={5} variant="dark">
        <div className="relative overflow-hidden rounded-xl p-6 backdrop-blur-sm">
          {/* Sweeping light effect on hover */}
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden"
          >
            <div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(167,139,250,0.06) 50%, transparent 60%)",
              }}
            />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-display font-semibold text-white">
                  {experience.position}
                </h3>
                <p className="text-white/70 mt-1 font-sans">
                  {experience.company}
                </p>
                {experience.location && (
                  <p className="text-sm text-white/50 mt-1.5 font-sans flex items-center gap-1.5">
                    <MapPin className="size-[13px] shrink-0 text-white/35" />
                    {experience.location}
                  </p>
                )}
              </div>
              <div className="text-sm text-white/50 whitespace-nowrap font-sans shrink-0">
                {experience.startDate}{" "}
                {experience.endDate
                  ? `– ${experience.endDate}`
                  : experience.current
                    ? "– Present"
                    : ""}
              </div>
            </div>

            {responsibilities.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {responsibilities.map((r) => (
                  <li key={r} className="flex gap-3">
                    <span className="text-white/35 shrink-0 font-sans">→</span>
                    <span className="font-sans leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            )}

            {experience.technologies && experience.technologies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {experience.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech._id}
                    className="orbit-chip"
                    style={{ "--chip-color": getCategoryColor(tech.category) } as React.CSSProperties}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CometCard>
    </div>
  );
}
