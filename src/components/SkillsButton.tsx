"use client";

import { useMemo, useState } from "react";
import type { SKILLS_QUERYResult } from "@/sanity/types";

type Skill = SKILLS_QUERYResult[number];

interface SkillButtonProps {
  skill: Skill;
  index: number;
  onHoverChange?: (id: string | null) => void;
}

type Effect = "shimmer" | "orbit";

const EFFECTS: Effect[] = ["shimmer", "orbit"];

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickEffect(skill: Skill, index: number): Effect {
  const key = `${skill._id || ""}|${skill.name || ""}|${skill.category || ""}|${index}`;
  return EFFECTS[hashString(key) % EFFECTS.length];
}

export function SkillButton({ skill, index, onHoverChange }: SkillButtonProps) {
  const effect = useMemo(() => pickEffect(skill, index), [skill, index]);
  const label = (skill.name ?? "").toString();
  const detail =
    (skill.proficiency ?? skill.category ?? "").toString() ||
    (skill.yearsOfExperience != null ? `${skill.yearsOfExperience} yrs` : "");

  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      data-skill-effect={effect}
      onMouseEnter={() => {
        setHover(true);
        onHoverChange?.(skill._id);
      }}
      onMouseLeave={() => {
        setHover(false);
        onHoverChange?.(null);
      }}
      className={[
        "relative w-full select-none overflow-hidden rounded-full",
        "border border-white/15 bg-white/[0.04] px-4 py-2.5 text-left",
        "transition-[background-color,border-color,box-shadow] duration-300",
        "hover:border-white/30 hover:bg-white/[0.08]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        effect === "orbit" ? "skill-orbit" : "",
      ].join(" ")}
      aria-label={label}
    >
      {/* Radial glow on hover */}
      <span
        className={[
          "pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
          hover ? "opacity-100" : "",
          "bg-[radial-gradient(circle_at_30%_20%,rgba(167,139,250,0.22),transparent_60%)]",
        ].join(" ")}
      />

      {/* Shimmer sweep */}
      {effect === "shimmer" && (
        <span className="skill-shimmer pointer-events-none absolute inset-0" />
      )}

      {/* Content */}
      <div className="relative z-10 min-w-0">
        <span className="text-sm font-medium text-white/90">{label}</span>

        {detail && (
          <div
            className={[
              "overflow-hidden text-xs text-white/50 font-sans transition-[max-height,opacity] duration-300",
              hover ? "max-h-8 opacity-100 mt-0.5" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            {detail}
          </div>
        )}
      </div>
    </button>
  );
}
