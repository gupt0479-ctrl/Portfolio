"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useIridescentEffect } from "@/lib/hooks/useIridescentEffect";
import type { PROJECTS_QUERYResult } from "@/sanity/types";

type Project = PROJECTS_QUERYResult[number];

interface ProjectsSliderProps {
  projects: PROJECTS_QUERYResult;
}

function getTechTags(project: Project): string[] {
  return (project.technologies ?? [])
    .map((t) => t?.name ?? null)
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .slice(0, 4);
}

function cta3dStyle(hovered: boolean, primary: boolean): CSSProperties {
  return {
    transition: "transform 180ms ease, box-shadow 180ms ease",
    willChange: "transform",
    transform: hovered
      ? "perspective(600px) rotateX(8deg) translateY(-4px) scale(1.03)"
      : "none",
    boxShadow: hovered
      ? primary
        ? "0 16px 32px rgba(255,255,255,0.12)"
        : "0 8px 20px rgba(167,139,250,0.15)"
      : "none",
  };
}

function ViewLiveButton({ href }: { href: string }) {
  const [hovered, setHovered] = useState(false);
  const { ref, overlayStyle } = useIridescentEffect({ gradientAlpha: 0.14 });

  return (
    <div
      ref={ref}
      className="relative inline-flex overflow-hidden rounded-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="pointer-events-none absolute inset-0 z-10 rounded-full"
        style={overlayStyle}
        aria-hidden
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={cta3dStyle(hovered, true)}
        className="relative z-20 inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black"
      >
        View Live
      </a>
    </div>
  );
}

function SourceButton({ href }: { href: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cta3dStyle(hovered, false)}
      className="inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/70"
    >
      Source
    </a>
  );
}

interface ProjectCardProps {
  project: Project;
  isCenter: boolean;
}

function ProjectCard({ project, isCenter }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const tags = getTechTags(project);
  const title = project.title?.trim() || "Untitled";

  return (
    <article
      className={[
        "rounded-xl border bg-white/[0.03] backdrop-blur-sm transition-all duration-300",
        isCenter
          ? "border-white/20 cursor-default"
          : "border-white/8 pointer-events-none",
      ].join(" ")}
      onMouseEnter={() => isCenter && setHovered(true)}
      onMouseLeave={() => isCenter && setHovered(false)}
    >
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-white leading-snug">
          {title}
        </h3>
        {project.tagline && (
          <p className="mt-2 line-clamp-2 text-sm text-white/55 font-sans leading-relaxed">
            {project.tagline}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/60 font-sans"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {isCenter && (
        <div
          className="overflow-hidden transition-[max-height] duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ maxHeight: hovered ? 320 : 0 }}
        >
          <div className="px-5 pb-5 border-t border-white/10 pt-4">
            <p className="text-sm text-white/55 font-sans leading-relaxed">
              {project.tagline}
            </p>
            {/* TODO: replace with project.description when schema field added */}
            <div className="my-3 border-t border-white/10" />
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {project.liveUrl ? (
                <ViewLiveButton href={project.liveUrl} />
              ) : null}
              {project.githubUrl ? (
                <SourceButton href={project.githubUrl} />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export function ProjectsSlider({ projects }: ProjectsSliderProps) {
  const safeProjects = projects ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragRef = useRef({ startX: 0, currentX: 0, isDragging: false });

  const goNext = useCallback(() => {
    if (!safeProjects.length) return;
    setCurrentIndex((prev) => (prev + 1) % safeProjects.length);
  }, [safeProjects.length]);

  const goPrev = useCallback(() => {
    if (!safeProjects.length) return;
    setCurrentIndex(
      (prev) => (prev - 1 + safeProjects.length) % safeProjects.length,
    );
  }, [safeProjects.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current.startX = e.clientX;
    dragRef.current.currentX = e.clientX;
    dragRef.current.isDragging = true;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.currentX = e.clientX;
  };
  const handleMouseUp = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    const diff = dragRef.current.startX - dragRef.current.currentX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    dragRef.current.startX = e.touches[0].clientX;
    dragRef.current.currentX = e.touches[0].clientX;
    dragRef.current.isDragging = true;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.currentX = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    const diff = dragRef.current.startX - dragRef.current.currentX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };

  if (!safeProjects.length) {
    return (
      <div className="text-white/50 font-sans text-sm">No projects found.</div>
    );
  }

  const prevIndex =
    (currentIndex - 1 + safeProjects.length) % safeProjects.length;
  const nextIndex = (currentIndex + 1) % safeProjects.length;

  const showSideCards = safeProjects.length >= 3;

  return (
    <section
      aria-label="Projects carousel"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-start gap-3">
        {showSideCards && (
          <div className="hidden md:block w-[220px] max-h-48 shrink-0 self-start overflow-hidden scale-[0.93] opacity-40 transition-transform duration-300">
            <ProjectCard project={safeProjects[prevIndex]} isCenter={false} />
          </div>
        )}

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous project"
          className="shrink-0 p-2.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-colors duration-200"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 min-w-0 scale-[1.04]">
          <AnimatePresence mode="wait">
            <motion.div
              key={safeProjects[currentIndex]._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ProjectCard
                project={safeProjects[currentIndex]}
                isCenter={true}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next project"
          className="shrink-0 p-2.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-colors duration-200"
        >
          <ChevronRight size={18} />
        </button>

        {showSideCards && (
          <div className="hidden md:block w-[220px] max-h-48 shrink-0 self-start overflow-hidden scale-[0.93] opacity-40 transition-transform duration-300">
            <ProjectCard project={safeProjects[nextIndex]} isCenter={false} />
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {safeProjects.map((p, idx) => (
          <button
            key={p._id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to project ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "bg-white w-6"
                : "bg-white/25 hover:bg-white/40 w-1.5"
            }`}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-white/35 font-sans">
        {currentIndex + 1} / {safeProjects.length}
      </p>
    </section>
  );
}
