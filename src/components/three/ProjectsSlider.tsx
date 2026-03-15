"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Github } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

interface ProjectCardProps {
  project: Project;
  isCenter: boolean;
}

function ProjectCard({ project, isCenter }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const tags = getTechTags(project);

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
      {/* Base content — always visible */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-display font-semibold text-white leading-snug">
            {project.title ?? "Untitled"}
          </h3>
          {project.liveUrl || project.githubUrl ? (
            <div className="flex gap-1.5 shrink-0">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Live site"
                  className="p-1.5 rounded-lg bg-white/[0.06] border border-white/15 text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200"
                >
                  <ExternalLink size={13} />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="GitHub repository"
                  className="p-1.5 rounded-lg bg-white/[0.06] border border-white/15 text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200"
                >
                  <Github size={13} />
                </a>
              )}
            </div>
          ) : null}
        </div>

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

      {/* Hover reveal — tagline + description */}
      {isCenter && (
        <div
          className={[
            "overflow-hidden transition-[max-height,opacity] duration-400 ease-in-out",
            hovered ? "max-h-48 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-2">
            {project.tagline && (
              <p className="text-sm text-white/80 font-sans leading-relaxed">
                {project.tagline}
              </p>
            )}
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
      {/* 3-card layout */}
      <div className="flex items-center gap-3">
        {/* Ghost left card */}
        {showSideCards && (
          <div className="hidden md:block w-[220px] shrink-0 opacity-40 scale-95 -translate-y-1.5 transition-all duration-300">
            <ProjectCard project={safeProjects[prevIndex]} isCenter={false} />
          </div>
        )}

        {/* Prev button */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous project"
          className="shrink-0 p-2.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-colors duration-200"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Center card */}
        <div className="flex-1 min-w-0">
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

        {/* Next button */}
        <button
          type="button"
          onClick={goNext}
          aria-label="Next project"
          className="shrink-0 p-2.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-colors duration-200"
        >
          <ChevronRight size={18} />
        </button>

        {/* Ghost right card */}
        {showSideCards && (
          <div className="hidden md:block w-[220px] shrink-0 opacity-40 scale-95 -translate-y-1.5 transition-all duration-300">
            <ProjectCard project={safeProjects[nextIndex]} isCenter={false} />
          </div>
        )}
      </div>

      {/* Dot indicators */}
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
