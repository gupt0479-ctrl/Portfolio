"use client";

import { cn } from "@/lib/utils";
import { ExperienceEvidenceCard } from "./ExperienceEvidenceCard";
import { ProjectEvidenceCard } from "./ProjectEvidenceCard";

interface ToolResultRendererProps {
  toolName: string;
  result: Record<string, unknown>;
}

interface LookupRecord {
  type: string;
  id: string;
  title: string;
  snippet: string;
}

interface ResumeResult {
  name: string;
  role: string;
  topSkills: string[];
  keyProjects: string[];
  currentExperience: { company: string; position: string } | null;
}

export function ToolResultRenderer({
  toolName,
  result,
}: ToolResultRendererProps) {
  // Error fallback — shown for any tool that returned ok: false
  if (result.ok === false && typeof result.error === "string") {
    return (
      <p className="text-[10px] text-red-400/70 font-mono mt-1">
        {result.error}
      </p>
    );
  }

  switch (toolName) {
    case "showProject": {
      if (result.ok === true && result.project) {
        return (
          <ProjectEvidenceCard
            project={
              result.project as {
                _id: string;
                title: string;
                slug: string | null;
                tagline?: string | null;
                technologies?: Array<{ name: string }> | null;
                liveUrl?: string | null;
                githubUrl?: string | null;
                description?: string | null;
              }
            }
          />
        );
      }
      return null;
    }

    case "showExperience": {
      if (result.ok === true && result.experience) {
        return (
          <ExperienceEvidenceCard
            experience={
              result.experience as {
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
            }
          />
        );
      }
      return null;
    }

    case "lookupFact": {
      const records = result.records as LookupRecord[] | undefined;
      if (!records || records.length === 0) return null;
      return (
        <div className={cn("cosmic-card rounded-xl p-3 mt-1")}>
          <p className="section-kicker mb-2 text-[10px]">{"// facts"}</p>
          <ul className="flex flex-col gap-2">
            {records.map((rec) => (
              <li key={rec.id} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-white/80">
                  {rec.title}
                </span>
                <span className="text-[10px] text-white/50 font-sans leading-relaxed">
                  {rec.snippet}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "getResume": {
      const resume = result as unknown as ResumeResult;
      const skills = resume.topSkills?.slice(0, 5) ?? [];
      return (
        <div className={cn("cosmic-card rounded-xl p-3 mt-1")}>
          <p className="section-kicker mb-1 text-[10px]">{"// resume"}</p>
          <p className="text-sm font-semibold text-white/90">{resume.name}</p>
          <p className="text-xs text-violet-300/80 font-mono mt-0.5">
            {resume.role}
          </p>
          {resume.currentExperience && (
            <p className="text-[10px] text-white/40 font-mono mt-0.5">
              {resume.currentExperience.position} @{" "}
              {resume.currentExperience.company}
            </p>
          )}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.map((skill) => (
                <span key={skill} className="orbit-chip text-[10px]">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "navigate":
    case "contact":
      // Side-effects handled in PortfolioLab; no card needed
      return null;

    default:
      return null;
  }
}
