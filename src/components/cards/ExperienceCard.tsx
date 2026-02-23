"use client";

import { useTilt } from "@/hooks/useTilt";
import type { EXPERIENCE_QUERYResult } from "@/sanity/types";

type Experience = EXPERIENCE_QUERYResult[0];

interface ExperienceCardProps {
  experience: Experience;
  index: number;
}

export function ExperienceCard({ experience, index }: ExperienceCardProps) {
  const ref = useTilt<HTMLDivElement>({ max: 9, scale: 1.02, speed: 0.14 });

  const responsibilities = (experience.responsibilities ?? [])
    .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
    .slice(0, 3);

  return (
    <div
      ref={ref}
      className="tiltCard group"
      style={{
        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      <div className="tiltInner">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="text-lg font-semibold text-white">
              {experience.position}
            </div>
            <div className="text-white/70 mt-1">{experience.company}</div>
            {experience.location && (
              <div className="text-sm text-white/50 mt-2">
                📍 {experience.location}
              </div>
            )}
          </div>
          <div className="text-sm text-white/60 whitespace-nowrap">
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
            {responsibilities.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-white/40 shrink-0">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}

        {experience.technologies && experience.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {experience.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech._id}
                className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/20"
              >
                {tech.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
