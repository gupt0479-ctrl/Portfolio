"use client";

import { cn } from "@/lib/utils";

interface Experience {
  _id: string;
  company: string;
  position: string;
  employmentType?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current: boolean;
  description?: string | null;
  responsibilities?: string[] | null;
  technologies?: Array<{ name: string }> | null;
}

interface ExperienceEvidenceCardProps {
  experience: Experience;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  // Expect YYYY-MM-DD or YYYY-MM
  const parts = iso.split("-");
  const year = parts[0];
  const month = parts[1] ? Number.parseInt(parts[1], 10) : null;
  if (!month) return year ?? "";
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[month - 1]} ${year}`;
}

function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  current: boolean,
): string {
  const start = formatDate(startDate);
  const end = current || !endDate ? "Present" : formatDate(endDate);
  if (!start) return end;
  return `${start} – ${end}`;
}

export function ExperienceEvidenceCard({
  experience,
}: ExperienceEvidenceCardProps) {
  const techs = experience.technologies?.slice(0, 6) ?? [];
  const dateRange = formatDateRange(
    experience.startDate,
    experience.endDate,
    experience.current,
  );
  const description = experience.description
    ? experience.description.length > 200
      ? `${experience.description.slice(0, 200)}…`
      : experience.description
    : null;

  return (
    <div className={cn("cosmic-card rounded-xl p-4")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white/90 leading-snug">
            {experience.position}
          </h4>
          <p className="text-xs text-violet-300/80 font-mono mt-0.5">
            {experience.company}
          </p>
        </div>
        <span className="orbit-chip shrink-0 text-[10px]">experience</span>
      </div>

      {/* Dates */}
      {dateRange && (
        <p className="text-[10px] text-white/40 font-mono mt-0.5">
          {dateRange}
        </p>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-white/55 mt-2 leading-relaxed font-sans">
          {description}
        </p>
      )}

      {/* Tech chips */}
      {techs.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {techs.map((tech) => (
            <span key={tech.name} className="orbit-chip text-[10px]">
              {tech.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
