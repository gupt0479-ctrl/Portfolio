"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Github } from "lucide-react";
import type { PROJECTS_QUERYResult } from "@/sanity/types";

type Project = PROJECTS_QUERYResult[number];

interface ProjectsSliderProps {
  projects: PROJECTS_QUERYResult;
}

export function ProjectsSlider({ projects }: ProjectsSliderProps) {
  const safeProjects = projects ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, currentX: 0, isDragging: false });

  const animationType = currentIndex % 3;

  const goNext = useCallback(() => {
    if (!safeProjects.length) return;
    setCurrentIndex((prev) => (prev + 1) % safeProjects.length);
    setExpandedId(null);
  }, [safeProjects.length]);

  const goPrev = useCallback(() => {
    if (!safeProjects.length) return;
    setCurrentIndex(
      (prev) => (prev - 1 + safeProjects.length) % safeProjects.length,
    );
    setExpandedId(null);
  }, [safeProjects.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  if (!safeProjects.length) {
    return <div className="text-white/60">No projects found.</div>;
  }

  const currentProject = safeProjects[currentIndex];
  const isExpanded = expandedId === currentProject._id;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current.startX = e.clientX;
    dragRef.current.currentX = e.clientX;
    dragRef.current.isDragging = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.currentX = e.clientX;
  };

  const handleMouseUp = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;

    const diff = dragRef.current.startX - dragRef.current.currentX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    dragRef.current.startX = e.touches[0].clientX;
    dragRef.current.currentX = e.touches[0].clientX;
    dragRef.current.isDragging = true;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.currentX = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;

    const diff = dragRef.current.startX - dragRef.current.currentX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
  };

  const getTechTags = (project: Project) =>
    (project.technologies ?? [])
      .map((t) => t?.name ?? null)
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .slice(0, 3);

  const getDescription = (project: Project) => project.tagline ?? "";

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="application"
      aria-label="Projects slider"
    >
      {/* Left arrow — absolutely positioned on the left side */}
      <button
        type="button"
        onClick={goPrev}
        aria-label="Previous project"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 p-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white transition"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Right arrow — absolutely positioned on the right side */}
      <button
        type="button"
        onClick={goNext}
        aria-label="Next project"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 p-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white transition"
      >
        <ChevronRight size={20} />
      </button>

      <div className="relative h-auto min-h-[500px] md:min-h-[600px] px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProject._id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 px-10"
          >
            <div className="tiltCard w-full h-full cursor-grab active:cursor-grabbing">
              <div className="tiltInner h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    {currentProject.title ?? "Untitled"}
                  </h3>

                  <p className="text-lg text-white/70 leading-relaxed">
                    {getDescription(currentProject)}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-6">
                    {getTechTags(currentProject).map((tech) => (
                      <span
                        key={`${currentProject._id}-${tech}`}
                        className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 pt-6 border-t border-white/20"
                    >
                      <div className="text-white/70 text-sm leading-relaxed mb-4">
                        {currentProject.tagline ?? ""}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                  <div className="flex gap-3">
                    {currentProject.liveUrl ? (
                      <a
                        href={currentProject.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition"
                      >
                        <ExternalLink size={16} />
                        Live
                      </a>
                    ) : null}

                    {currentProject.githubUrl ? (
                      <a
                        href={currentProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition"
                      >
                        <Github size={16} />
                        Code
                      </a>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : currentProject._id)
                    }
                    className="text-sm text-white/60 hover:text-white transition"
                  >
                    {isExpanded ? "Show Less" : "More Details"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <div className="flex gap-2">
          {safeProjects.map((p, idx) => (
            <button
              key={p._id}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setExpandedId(null);
              }}
              aria-label={`Go to project ${idx + 1}`}
              className={`h-2 rounded-full transition ${
                idx === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/30 hover:bg-white/50 w-2"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-white/50">
        {currentIndex + 1} of {safeProjects.length}
      </div>

      {/* Keep the animationType hook points for your CSS animation experiments */}
      <div className="hidden">
        {animationType === 0 ? "reveal-on-hover" : ""}
        {animationType === 1 ? "click-surprise" : ""}
        {animationType === 2 ? "fall-from-sky" : ""}
      </div>
    </div>
  );
}
