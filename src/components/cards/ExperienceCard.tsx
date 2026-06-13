"use client";

import { ChevronDown, ExternalLink, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { CometCard } from "@/components/ui/comet-card";
import { useSpaceFloat } from "@/hooks/use-space-float";
import { getSkillColor } from "@/lib/category-colors";
import { urlFor } from "@/sanity/lib/image";
import type { EXPERIENCE_QUERYResult } from "@/sanity/types";

type Experience = EXPERIENCE_QUERYResult[0];

const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

interface ExperienceCardProps {
  experience: Experience;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function ExperienceCard({
  experience,
  index,
  isOpen,
  onToggle,
}: ExperienceCardProps) {
  const { ref, style } = useSpaceFloat({ radius: 4, rotate: 0.3, speed: 0.7 });

  const responsibilities = (experience.responsibilities ?? [])
    .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
    .slice(0, 3);

  const achievements = (experience.achievements ?? [])
    .filter((a): a is string => typeof a === "string" && a.trim().length > 0)
    .slice(0, 2);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        ...style,
        animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
      }}
      className="group"
    >
      <CometCard rotateDepth={3} translateDepth={5} variant="dark">
        <div className="relative overflow-hidden rounded-xl p-6 backdrop-blur-sm">
          {/* Sweeping light effect on hover */}
          <div className="pointer-events-none absolute inset-0 z-20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(167,139,250,0.06) 50%, transparent 60%)",
              }}
            />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex flex-1 items-start gap-3">
                {experience.companyLogo && (
                  <Image
                    src={urlFor(experience.companyLogo)
                      .width(80)
                      .height(80)
                      .url()}
                    alt={
                      experience.company
                        ? `${experience.company} logo`
                        : "Company logo"
                    }
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-lg object-contain bg-white/[0.04] border border-white/10 p-1"
                  />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-display font-semibold text-white">
                      {experience.position}
                    </h3>
                    {experience.employmentType && (
                      <span className="orbit-chip">
                        {EMPLOYMENT_LABELS[experience.employmentType] ??
                          experience.employmentType}
                      </span>
                    )}
                  </div>
                  {experience.companyWebsite ? (
                    <a
                      href={experience.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 mt-1 font-sans inline-flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      {experience.company}
                      <ExternalLink
                        className="size-3.5 text-white/35"
                        aria-hidden
                      />
                    </a>
                  ) : (
                    <p className="text-white/70 mt-1 font-sans">
                      {experience.company}
                    </p>
                  )}
                  {experience.location && (
                    <p className="text-sm text-white/50 mt-1.5 font-sans flex items-center gap-1.5">
                      <MapPin className="size-[13px] shrink-0 text-white/35" />
                      {experience.location}
                    </p>
                  )}
                </div>
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

            {achievements.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm">
                {achievements.map((a) => (
                  <li key={a} className="flex gap-2 text-amber-200/75">
                    <span className="shrink-0 text-amber-300/50">★</span>
                    <span className="font-sans leading-relaxed">{a}</span>
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
                    style={
                      {
                        "--chip-color": getSkillColor(
                          tech.color,
                          tech.category,
                        ),
                      } as React.CSSProperties
                    }
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description expand toggle — only if description exists */}
            {experience.description && experience.description.length > 0 && (
              <div className="mt-3">
                {/* Toggle button — bottom-right aligned, only visible on group-hover */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onToggle}
                    aria-label={
                      isOpen ? "Hide description" : "Show description"
                    }
                    aria-expanded={isOpen}
                    className="flex items-center gap-1 text-xs text-white/0 group-hover:text-white/50 hover:!text-white/80 focus-visible:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded transition-colors duration-200 font-sans"
                  >
                    <span>{isOpen ? "less" : "more"}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex"
                    >
                      <ChevronDown className="size-3.5" />
                    </motion.span>
                  </button>
                </div>

                {/* Description content — animated height */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="description"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <div className="prose prose-invert prose-sm max-w-none text-white/55 font-sans [&>p]:leading-relaxed [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>li]:mb-1">
                          <PortableText value={experience.description ?? []} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </CometCard>
    </div>
  );
}
