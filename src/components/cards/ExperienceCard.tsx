"use client";

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
      className="group"
      style={{
        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(168,85,247,0.12)] hover:-translate-y-0.5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-display font-semibold text-white">
              {experience.position}
            </h3>
            <p className="text-white/70 mt-1 font-sans">{experience.company}</p>
            {experience.location && (
              <p className="text-sm text-white/50 mt-1.5 font-sans">
                📍 {experience.location}
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
                className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-white/70 border border-white/15 font-sans transition-colors duration-200 group-hover:border-white/25"
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
