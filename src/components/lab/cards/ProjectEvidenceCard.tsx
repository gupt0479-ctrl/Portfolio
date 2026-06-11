"use client";

import { ExternalLink, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  _id: string;
  title: string;
  slug: string | null;
  tagline?: string | null;
  technologies?: Array<{ name: string }> | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  description?: string | null;
}

interface ProjectEvidenceCardProps {
  project: Project;
}

export function ProjectEvidenceCard({ project }: ProjectEvidenceCardProps) {
  const techs = project.technologies?.slice(0, 6) ?? [];

  return (
    <div className={cn("cosmic-card rounded-xl p-4")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-white/90 leading-snug">
          {project.title}
        </h4>
        <span className="orbit-chip shrink-0 text-[10px]">project</span>
      </div>

      {/* Tagline */}
      {project.tagline && (
        <p className="text-xs text-white/60 mt-1 font-sans leading-relaxed">
          {project.tagline}
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

      {/* Footer links */}
      {(project.liveUrl || project.githubUrl) && (
        <div className="flex items-center gap-3 mt-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-violet-300/70 hover:text-violet-200 font-mono transition-colors flex items-center gap-1"
            >
              <ExternalLink className="size-3" aria-hidden="true" />
              Live
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-violet-300/70 hover:text-violet-200 font-mono transition-colors flex items-center gap-1"
            >
              <Github className="size-3" aria-hidden="true" />
              Code
            </a>
          )}
        </div>
      )}
    </div>
  );
}
