"use client";

import { MapPin } from "lucide-react";
import { CometCard } from "@/components/ui/comet-card";
import type { EXPERIENCE_QUERYResult } from "@/sanity/types";

type Experience = EXPERIENCE_QUERYResult[0];

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
      style={{
        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      <CometCard rotateDepth={4} translateDepth={5}>
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
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
                    className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-white/70 border border-white/15 font-sans"
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
