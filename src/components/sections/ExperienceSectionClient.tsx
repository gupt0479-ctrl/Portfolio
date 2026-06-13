"use client";

import { useState } from "react";
import { SpaceRail } from "@/components/ui/space-rail";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import type { EXPERIENCE_QUERYResult } from "@/sanity/types";

interface ExperienceSectionClientProps {
  experiences: EXPERIENCE_QUERYResult;
}

export function ExperienceSectionClient({
  experiences,
}: ExperienceSectionClientProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex gap-6">
      <SpaceRail itemCount={experiences.length} />
      <div className="flex flex-col flex-1 min-w-0">
        {experiences.map((exp, idx) => (
          <div
            key={exp._id}
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
