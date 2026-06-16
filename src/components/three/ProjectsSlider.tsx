"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CometCard } from "@/components/ui/comet-card";
import { useSpaceFloat } from "@/hooks/use-space-float";
import { useIridescentEffect } from "@/hooks/useIridescentEffect";
import { getSkillColor } from "@/lib/category-colors";
import { urlFor } from "@/sanity/lib/image";
import type { PROJECTS_QUERYResult } from "@/sanity/types";

type Project = PROJECTS_QUERYResult[number];

interface ProjectsSliderProps {
  projects: PROJECTS_QUERYResult;
}

function ViewLiveButton({ href }: { href: string }) {
  const { ref } = useIridescentEffect({ gradientAlpha: 0.14 });

  return (
    <div
      ref={ref}
      className="relative inline-flex overflow-hidden rounded-full"
    >
      <span
        className="pointer-events-none absolute inset-0 z-10 rounded-full"
        style={{ background: "var(--irid-bg, transparent)" }}
        aria-hidden
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="float-btn relative z-20 inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black"
      >
        View Live
      </a>
    </div>
  );
}

function SourceButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="float-btn inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/70"
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
  const tags = (project.technologies ?? [])
    .filter(
      (t): t is NonNullable<typeof t> => t != null && Boolean(t.name?.trim()),
    )
    .slice(0, 4);
  const title = project.title?.trim() || "Untitled";

  return (
    <article
      className={[
        "rounded-xl transition-all duration-300",
        isCenter
          ? "cosmic-card cursor-default"
          : "cosmic-card--dark pointer-events-none",
      ].join(" ")}
      onMouseEnter={() => isCenter && setHovered(true)}
      onMouseLeave={() => isCenter && setHovered(false)}
    >
      {project.coverImage && (
        <div className="relative h-40 w-full overflow-hidden rounded-t-xl border-b border-white/[0.06]">
          <Image
            src={urlFor(project.coverImage).width(600).height(280).url()}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
        </div>
      )}
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
            {tags.map((tech) => (
              <span
                key={tech._id}
                className="orbit-chip"
                style={
                  {
                    "--chip-color": getSkillColor(tech.color, tech.category),
                  } as React.CSSProperties
                }
              >
                {tech.name}
              </span>
            ))}
          </div>
        )}

        {isCenter && project.summary && (
          <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <p className="text-xs text-white/55 font-sans leading-relaxed line-clamp-3">
              {project.summary}
            </p>
          </div>
        )}
      </div>

      {isCenter && (project.liveUrl || project.githubUrl) && (
        <div
          className="px-5 pb-5 border-t border-white/[0.06] pt-4 transition-opacity duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            {project.liveUrl ? <ViewLiveButton href={project.liveUrl} /> : null}
            {project.githubUrl ? (
              <SourceButton href={project.githubUrl} />
            ) : null}
          </div>
        </div>
      )}
    </article>
  );
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 200 : -200,
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -200 : 200,
    opacity: 0,
    scale: 0.92,
  }),
};

export function ProjectsSlider({ projects }: ProjectsSliderProps) {
  const safeProjects = projects ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [tetherActive, setTetherActive] = useState(false);
  const tetherDirRef = useRef(0);
  const dragRef = useRef({ startX: 0, currentX: 0, isDragging: false });

  const { ref: centerFloatRef, style: centerFloatStyle } = useSpaceFloat({
    radius: 2,
    rotate: 0.1,
  });
  const { ref: leftFloatRef, style: leftFloatStyle } = useSpaceFloat({
    radius: 4,
    rotate: 0.3,
  });
  const { ref: rightFloatRef, style: rightFloatStyle } = useSpaceFloat({
    radius: 4,
    rotate: 0.3,
  });

  const goNext = useCallback(() => {
    if (!safeProjects.length) return;
    setDirection(1);
    tetherDirRef.current = 1;
    setTetherActive(true);
    setTimeout(() => setTetherActive(false), 440);
    setCurrentIndex((prev) => (prev + 1) % safeProjects.length);
  }, [safeProjects.length]);

  const goPrev = useCallback(() => {
    if (!safeProjects.length) return;
    setDirection(-1);
    tetherDirRef.current = -1;
    setTetherActive(true);
    setTimeout(() => setTetherActive(false), 440);
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

  useEffect(() => {
    const handleOrbNav = (e: Event) => {
      const detail = (
        e as CustomEvent<{ sectionId: string; itemSlug?: string | null }>
      ).detail;
      if (detail.sectionId !== "projects" || !detail.itemSlug) return;
      const idx = safeProjects.findIndex((p) => {
        // Sanity slugs can be either a string or {current: string}
        const slug =
          typeof p.slug === "string"
            ? p.slug
            : (p.slug as { current?: string } | null)?.current;
        return slug === detail.itemSlug;
      });
      if (idx < 0) return;
      setDirection(idx > currentIndex ? 1 : -1);
      setCurrentIndex(idx);
    };
    window.addEventListener("orby:navigate", handleOrbNav);
    return () => window.removeEventListener("orby:navigate", handleOrbNav);
  }, [safeProjects, currentIndex]);

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
      className="relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {tetherActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center overflow-hidden"
        >
          <div
            className="h-[2px] w-full max-w-sm rounded-full"
            style={{
              background:
                tetherDirRef.current > 0
                  ? "linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.0) 5%, rgba(167,139,250,0.65) 35%, rgba(103,232,249,0.85) 55%, rgba(167,139,250,0.35) 80%, transparent 100%)"
                  : "linear-gradient(270deg, transparent 0%, rgba(167,139,250,0.0) 5%, rgba(167,139,250,0.65) 35%, rgba(103,232,249,0.85) 55%, rgba(167,139,250,0.35) 80%, transparent 100%)",
              boxShadow:
                "0 0 14px rgba(167,139,250,0.55), 0 0 4px rgba(103,232,249,0.35)",
              animation: "tether-flash 0.44s ease-out forwards",
            }}
          />
        </div>
      )}
      <div className="flex items-center gap-3">
        {showSideCards && (
          <div
            ref={leftFloatRef as React.RefObject<HTMLDivElement>}
            style={leftFloatStyle}
            className="hidden md:block w-[260px] shrink-0 self-center opacity-35 scale-[0.88] blur-[1px] pointer-events-none transition-all duration-300"
          >
            <ProjectCard project={safeProjects[prevIndex]} isCenter={false} />
          </div>
        )}

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous project"
          className="float-btn shrink-0 p-2.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/10 text-white/70 hover:text-white transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={centerFloatRef as React.RefObject<HTMLDivElement>}
          style={centerFloatStyle}
          className="flex-1 min-w-0"
        >
          <CometCard rotateDepth={3} translateDepth={5}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={safeProjects[currentIndex]._id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <ProjectCard
                  project={safeProjects[currentIndex]}
                  isCenter={true}
                />
              </motion.div>
            </AnimatePresence>
          </CometCard>
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next project"
          className="float-btn shrink-0 p-2.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/10 text-white/70 hover:text-white transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronRight size={18} />
        </button>

        {showSideCards && (
          <div
            ref={rightFloatRef as React.RefObject<HTMLDivElement>}
            style={rightFloatStyle}
            className="hidden md:block w-[260px] shrink-0 self-center opacity-35 scale-[0.88] blur-[1px] pointer-events-none transition-all duration-300"
          >
            <ProjectCard project={safeProjects[nextIndex]} isCenter={false} />
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-0.5">
        {safeProjects.map((p, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={p._id}
              type="button"
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to project ${idx + 1}${p.title ? `: ${p.title}` : ""}`}
              aria-current={isActive ? "true" : undefined}
              className="flex items-center justify-center min-w-[24px] min-h-[24px] transition-all duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 rounded-full"
            >
              <span
                style={{
                  display: "block",
                  width: isActive ? "28px" : "6px",
                  height: "6px",
                  borderRadius: isActive ? "3px" : "50%",
                  background: isActive
                    ? "rgba(167, 139, 250, 0.8)"
                    : "rgba(255, 255, 255, 0.2)",
                  boxShadow: isActive
                    ? "0 0 12px rgba(167, 139, 250, 0.65), 0 0 4px rgba(167, 139, 250, 0.35)"
                    : undefined,
                  transition: "all 300ms",
                }}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-white/35 font-sans">
        {currentIndex + 1} / {safeProjects.length}
      </p>
    </section>
  );
}
