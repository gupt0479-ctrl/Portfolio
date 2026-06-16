"use client";

import { useEffect, useRef, useState } from "react";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { SpaceRail } from "@/components/ui/space-rail";
import type { EXPERIENCE_QUERYResult } from "@/sanity/types";

interface ExperienceSectionClientProps {
  experiences: EXPERIENCE_QUERYResult;
}

export function ExperienceSectionClient({
  experiences,
}: ExperienceSectionClientProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleOrbNav = (e: Event) => {
      const detail = (
        e as CustomEvent<{ sectionId: string; itemIndex?: number | null }>
      ).detail;
      if (detail.sectionId !== "experience") return;
      const idx = detail.itemIndex;
      if (typeof idx !== "number") return;
      const exp = experiences[idx];
      if (!exp) return;
      // Open the card
      setOpenId(exp._id);
      // Scroll to it after a brief delay (let React re-render first)
      setTimeout(() => {
        const el = cardRefs.current[exp._id];
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    };
    window.addEventListener("orby:navigate", handleOrbNav);
    return () => window.removeEventListener("orby:navigate", handleOrbNav);
  }, [experiences]);

  return (
    <div className="flex gap-6">
      <SpaceRail itemCount={experiences.length} />
      <div className="flex flex-col flex-1 min-w-0">
        {experiences.map((exp, idx) => (
          <div
            key={exp._id}
            ref={(el) => {
              cardRefs.current[exp._id] = el;
            }}
            className={idx < experiences.length - 1 ? "pb-6" : ""}
          >
            <ExperienceCard
              experience={exp}
              index={idx}
              isOpen={openId === exp._id}
              onToggle={() => toggle(exp._id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
