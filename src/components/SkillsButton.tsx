"use client";

import { useMemo, useRef, useState } from "react";
import type { SKILLS_QUERYResult } from "@/sanity/types";

type Skill = SKILLS_QUERYResult[number];

interface SkillButtonProps {
  skill: Skill;
  index: number;
  onHoverChange?: (id: string | null) => void;
  onClickBurst?: (id: string) => void;
}

type Effect =
  | "glitch"
  | "tilt"
  | "magnet"
  | "flip"
  | "drop"
  | "scan"
  | "shimmer"
  | "orbit";

const EFFECTS: Effect[] = [
  "glitch",
  "tilt",
  "magnet",
  "flip",
  "drop",
  "scan",
  "shimmer",
  "orbit",
];

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

export function SkillButton({
  skill,
  index,
  onHoverChange,
  onClickBurst,
}: SkillButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const effect = useMemo(() => pickEffect(skill, index), [skill, index]);
  const label = (skill.name ?? "").toString();
  const detail =
    (skill.proficiency ?? skill.category ?? "").toString() ||
    (skill.yearsOfExperience != null ? `${skill.yearsOfExperience} yrs` : "");

  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);

  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height;

    if (effect === "tilt") {
      const tiltX = (py - 0.5) * -14;
      const tiltY = (px - 0.5) * 14;
      setRx(tiltX);
      setRy(tiltY);
    }

    if (effect === "magnet") {
      const dx = (px - 0.5) * 14;
      const dy = (py - 0.5) * 14;
      setMx(dx);
      setMy(dy);
    }
  };

  const resetMotion = () => {
    setRx(0);
    setRy(0);
    setMx(0);
    setMy(0);
  };

  const onClick = () => {
    onClickBurst?.(skill._id);
    if (effect === "drop") {
      setGone(true);
      window.setTimeout(() => setGone(false), 900);
      return;
    }
    setOpen((v) => !v);
  };

  const base =
    "relative w-full select-none overflow-hidden rounded-full border border-white/20 bg-white/5 px-4 py-2 text-left transition-[transform,opacity,background-color,border-color,filter] duration-300";
  const hoverBase =
    "hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30";
  const subtle = "text-white/80";

  const style: React.CSSProperties = {
    transform:
      effect === "tilt"
        ? `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`
        : effect === "magnet"
          ? `translate3d(${mx}px, ${my}px, 0)`
          : undefined,
    opacity: gone ? 0 : 1,
    filter: gone ? "blur(10px)" : undefined,
  };

  return (
    <button
      ref={ref}
      type="button"
      data-skill-effect={effect}
      onMouseEnter={() => {
        setHover(true);
        onHoverChange?.(skill._id);
      }}
      onMouseLeave={() => {
        setHover(false);
        resetMotion();
        onHoverChange?.(null);
      }}
      onMouseMove={onMove}
      onClick={onClick}
      className={[
        base,
        hoverBase,
        subtle,
        effect === "drop" ? "skill-drop" : "",
        effect === "orbit" ? "skill-orbit" : "",
      ].join(" ")}
      style={style}
      aria-label={label}
    >
      {/* shared glow */}
      <span
        className={[
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          hover ? "opacity-100" : "opacity-0",
          "bg-[radial-gradient(circle_at_30%_20%,rgba(167,139,250,0.28),transparent_55%)]",
        ].join(" ")}
      />

      {/* GLITCH */}
      {effect === "glitch" && (
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}

      {/* SCAN */}
      {effect === "scan" && (
        <span className="skill-scanline pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}

      {/* SHIMMER */}
      {effect === "shimmer" && (
        <span className="skill-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}

      {/* content */}
      {effect === "flip" ? (
        <div className="skill-flip relative h-7">
          <div className="skill-flip-inner">
            <div className="skill-flip-face skill-flip-front">
              <span className="text-sm font-medium text-white">{label}</span>
            </div>
            <div className="skill-flip-face skill-flip-back">
              <span className="text-xs font-semibold text-white/90">
                {detail || "Details"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {effect === "glitch" ? (
              <span className="relative inline-block">
                <span className="text-sm font-medium text-white">{label}</span>
                <span className="skill-glitch-a absolute left-0 top-0 text-sm font-medium">
                  {label}
                </span>
                <span className="skill-glitch-b absolute left-0 top-0 text-sm font-medium">
                  {label}
                </span>
              </span>
            ) : (
              <span className="text-sm font-medium text-white">{label}</span>
            )}

            <div
              className={[
                "mt-1 overflow-hidden text-xs text-white/60 transition-[max-height,opacity,transform] duration-300",
                open || hover
                  ? "max-h-16 opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-1",
              ].join(" ")}
            >
              {detail}
            </div>
          </div>

          <span
            className={[
              "shrink-0 rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[10px] font-medium text-white/70",
              hover ? "border-white/35 bg-white/10" : "",
            ].join(" ")}
          >
            {effect.toUpperCase()}
          </span>
        </div>
      )}

      {/* click pulse (all except drop) */}
      {effect !== "drop" && (
        <span
          className={[
            "pointer-events-none absolute inset-0 rounded-full border border-white/40 opacity-0",
            open ? "animate-[skillPulse_700ms_ease-out_1]" : "",
          ].join(" ")}
        />
      )}
    </button>
  );
}
