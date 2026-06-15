"use client";

import { type CSSProperties, type RefObject, useMemo, useState } from "react";
import { SkillsCapabilityGraph } from "@/components/sections/SkillsCapabilityGraph";
import { CometCard } from "@/components/ui/comet-card";
import { useSpaceFloat } from "@/hooks/use-space-float";
import { useIridescentEffect } from "@/hooks/useIridescentEffect";
import { formatCategory, normalizeCategoryKey } from "@/lib/utils";
import type { SKILLS_QUERYResult } from "@/sanity/types";

type Skill = SKILLS_QUERYResult[number];

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "#8f7cf7",
  backend: "#60a5fa",
  "ai-ml": "#34d399",
  devops: "#f472b6",
  database: "#fb923c",
  "data-systems": "#fb923c",
  cloud: "#38bdf8",
  mobile: "#a78bfa",
  tools: "#facc15",
  design: "#f87171",
  testing: "#4ade80",
  "soft-skills": "#94a3b8",
  other: "#cbd5e1",
  academic: "#e879f9",
};

const FALLBACK_BAR = "#8f7cf7";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  frontend: "The layer users actually see and interact with.",
  backend: "APIs, services, and the logic that powers products.",
  "ai-ml": "Models, embeddings, and intelligent system design.",
  devops: "Deployment pipelines, infrastructure, and reliability.",
  database: "Data modeling, query optimization, and persistence.",
  "data-systems": "Data modeling, query optimization, and persistence.",
  cloud: "Scalable infrastructure across distributed systems.",
  mobile: "Cross-platform and native mobile experiences.",
  tools: "The developer toolchain and productivity ecosystem.",
  design: "Visual thinking, prototyping, and system aesthetics.",
  testing: "Quality assurance, coverage, and confidence.",
  "soft-skills": "Communication, leadership, and team dynamics.",
  other: "Everything else that doesn't fit a clean box.",
};

function getHighestCategory(skills: SKILLS_QUERYResult): string | null {
  const counts = new Map<string, number>();
  for (const skill of skills) {
    const cat = skill.category ?? "other";
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  let max = 0;
  let maxCat: string | null = null;
  for (const [cat, count] of counts) {
    if (count > max) {
      max = count;
      maxCat = cat;
    }
  }
  return maxCat;
}

// ─── Category pill ────────────────────────────────────────────────────────────

function CategoryPill({
  label,
  count,
  active,
  categoryKey,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  categoryKey: string | null;
  onClick: () => void;
}) {
  const { ref, style } = useSpaceFloat({ radius: 3, rotate: 0.2, speed: 0.6 });
  const [hovered, setHovered] = useState(false);
  const k = categoryKey ? normalizeCategoryKey(categoryKey) : null;

  // Build outer button style based on category
  const btnStyle: CSSProperties = {};
  if (k === "frontend" && hovered) {
    btnStyle.boxShadow = "0 0 0 1px rgba(143,124,247,0.4)";
  } else if (k === "design" && hovered) {
    btnStyle.boxShadow =
      "0 0 0 1px rgba(248,113,113,0.45), 0 0 12px rgba(248,113,113,0.15)";
  } else if (k === "cloud" && hovered) {
    btnStyle.boxShadow =
      "0 0 0 1px rgba(56,189,248,0.35), 0 0 10px rgba(56,189,248,0.12)";
  }

  return (
    <div ref={ref as RefObject<HTMLDivElement>} style={style}>
      <CometCard variant="ghost" rotateDepth={10} translateDepth={12}>
        <button
          type="button"
          onClick={onClick}
          aria-pressed={active}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={btnStyle}
          className={[
            "group relative overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
            active
              ? "border-violet-400/50 bg-violet-500/30 backdrop-blur-md text-white shadow-[0_0_8px_rgba(139,92,246,0.2)]"
              : "border-white/25 bg-neutral-900/70 backdrop-blur-md text-white/60 hover:border-white/35 hover:text-white/80 hover:bg-neutral-900/80",
            k === "ai-ml" && hovered
              ? "animate-[pulse-glow_1s_ease-in-out_infinite]"
              : "",
            k === "soft-skills" && hovered ? "translate-y-[-2px]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* frontend: shimmer sweep */}
          {k === "frontend" && (
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
              aria-hidden
            />
          )}

          {/* mobile: expanding ring overlay */}
          {k === "mobile" && hovered && (
            <span
              className="pointer-events-none absolute inset-0 rounded-full border border-violet-400/55"
              aria-hidden
              style={{ animation: "ring-expand 1s ease-out infinite" }}
            />
          )}

          <span className="relative flex items-center gap-1">
            {label}
            <span className="opacity-60">{count}</span>

            {/* backend: blinking cursor */}
            {k === "backend" && hovered && (
              <span className="animate-[blink_1s_step-end_infinite] text-blue-300/70">
                _
              </span>
            )}

            {/* tools: cyan terminal prompt (distinct from backend) */}
            {k === "tools" && hovered && (
              <span className="font-mono text-cyan-400/80">
                {">"}
                <span className="animate-[blink_0.8s_step-end_infinite] text-cyan-300/90">
                  _
                </span>
              </span>
            )}

            {/* devops: pink deploy dots */}
            {k === "devops" && hovered && (
              <span className="inline-flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block w-1 h-1 rounded-full bg-pink-400/65 animate-[deploy-dot_0.6s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </span>
            )}

            {/* database / data-systems: sparkline bars */}
            {(k === "database" || k === "data-systems") && hovered && (
              <span className="inline-flex items-end gap-px">
                {[
                  { id: "a", h: 3 },
                  { id: "b", h: 5 },
                  { id: "c", h: 4 },
                  { id: "d", h: 6 },
                  { id: "e", h: 3 },
                ].map((bar, i) => (
                  <span
                    key={bar.id}
                    className="inline-block w-0.5 rounded-sm bg-orange-400/70 animate-[pulse-glow_0.8s_ease-in-out_infinite]"
                    style={{
                      height: `${bar.h}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </span>
            )}

            {/* testing: sequential green check marks */}
            {k === "testing" && hovered && (
              <span className="inline-flex gap-0.5">
                {["✓", "✓", "✓"].map((ch, i) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable array
                    key={i}
                    className="text-xs text-green-400/85 animate-[blink_1.2s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 220}ms` }}
                    aria-hidden
                  >
                    {ch}
                  </span>
                ))}
              </span>
            )}

            {/* cloud: floating micro-dots */}
            {k === "cloud" && hovered && (
              <span className="inline-flex gap-0.5 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block w-1 h-1 rounded-full bg-sky-400/65 animate-[float-micro_1s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </span>
            )}

            {/* design: warm halo handled by btnStyle above — no inline node needed */}

            {/* academic: orbiting star dot */}
            {k === "academic" && hovered && (
              <span
                className="pointer-events-none absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/85"
                aria-hidden
                style={{
                  marginTop: "-3px",
                  marginLeft: "-3px",
                  transformOrigin: "3px 3px",
                  animation: "orbit-pill 2.5s linear infinite",
                  boxShadow: "0 0 5px rgba(216,180,254,0.7)",
                }}
              />
            )}
          </span>
        </button>
      </CometCard>
    </div>
  );
}

// ─── Skills filter ────────────────────────────────────────────────────────────

function SkillsFilter({
  skills,
  selected,
  onChange,
}: {
  skills: SKILLS_QUERYResult;
  selected: string | null;
  onChange: (category: string) => void;
}) {
  const { categories, counts } = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const s of skills) {
      const cat = s.category ?? "other";
      countMap.set(cat, (countMap.get(cat) ?? 0) + 1);
    }
    const cats = Array.from(countMap.keys()).sort((a, b) => a.localeCompare(b));
    return { categories: cats, counts: countMap };
  }, [skills]);

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {categories.map((c) => (
        <CategoryPill
          key={c}
          label={formatCategory(c)}
          count={counts.get(c) ?? 0}
          active={c === selected}
          categoryKey={c}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}

// ─── Skill pill (fixed-size, 7 effects) ───────────────────────────────────────

function SkillPill({
  skill,
  effectIndex,
}: {
  skill: Skill;
  effectIndex: number;
}) {
  const { ref } = useIridescentEffect({ gradientAlpha: 0.1 });
  const [hovered, setHovered] = useState(false);
  const label = (skill.name ?? "").toString();
  const proficiency =
    (skill.proficiency ?? "")
      .toString()
      .replace(/^\w/, (c) => c.toUpperCase()) || "";
  const effect = effectIndex % 7;

  const effectStyle: CSSProperties = {
    // effect 6: 3D tilt — no translateY to avoid size change
    transform:
      hovered && effect === 6
        ? "perspective(400px) rotateY(5deg)"
        : "perspective(600px)",
    transition:
      "transform 180ms ease, border-color 200ms ease, box-shadow 200ms ease",
    ...(hovered && effect === 1
      ? {
          boxShadow:
            "0 0 0 3px rgba(96,165,250,0.22), 0 0 0 7px rgba(96,165,250,0.09), 0 0 0 12px rgba(96,165,250,0.04)",
        }
      : hovered && effect === 4
        ? {
            background:
              "linear-gradient(90deg, rgba(52,211,153,0.13) 0%, rgba(52,211,153,0.06) 100%)",
          }
        : hovered && effect === 6
          ? { boxShadow: "4px 4px 18px rgba(167,139,250,0.22)" }
          : {}),
  };

  return (
    <div ref={ref} className="relative w-full min-w-0">
      {/* effect 3: constellation dots — outside overflow-hidden button */}
      {hovered && effect === 3 && (
        <>
          <span
            className="pointer-events-none absolute -top-1 -left-1 w-1 h-1 rounded-full bg-violet-400/65 z-20"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -top-1 -right-1 w-1 h-1 rounded-full bg-cyan-400/65 z-20"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -bottom-1 left-1/2 w-1 h-1 rounded-full bg-violet-300/55 z-20"
            aria-hidden
          />
        </>
      )}

      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={effectStyle}
        className={[
          "relative w-full select-none overflow-hidden rounded-full",
          "border border-white/20 bg-black/25",
          "h-9 px-3",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
          hovered
            ? "border-white/40 shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_0_14px_rgba(167,139,250,0.12)]"
            : "",
          hovered && effect === 2
            ? "animate-[glitch-scan_0.15s_steps(2)_infinite]"
            : "",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={label}
      >
        <span
          className="pointer-events-none absolute inset-0 z-[1] rounded-full"
          style={{ background: "var(--irid-bg, transparent)" }}
          aria-hidden
        />

        {/* effect 5: orbit dot */}
        {effect === 5 && (
          <span
            className="pointer-events-none absolute top-0 left-1/2 z-20 w-1.5 h-1.5 rounded-full bg-violet-400/80"
            aria-hidden
            style={{
              animation: hovered ? "orbit-pill 1.4s linear infinite" : "none",
              boxShadow: hovered ? "0 0 6px rgba(167,139,250,0.75)" : "none",
              marginTop: "-3px",
              marginLeft: "-3px",
              transformOrigin: "3px 3px",
            }}
          />
        )}

        <div className="relative z-10 flex w-full h-full items-center justify-between gap-2">
          <span className="text-sm font-medium text-white/85 truncate min-w-0">
            {label}
          </span>
          {/* Proficiency: always in DOM (no layout shift), transparent when not hovered */}
          {proficiency && (
            <span
              className="shrink-0 font-sans text-xs capitalize whitespace-nowrap transition-opacity duration-150"
              style={{
                opacity: hovered ? 1 : 0,
                color: "rgba(255,255,255,0.4)",
              }}
              aria-hidden={!hovered}
            >
              {proficiency}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

// ─── Active category view ─────────────────────────────────────────────────────

function ActiveCategoryView({
  skills,
  categoryKey,
}: {
  skills: SKILLS_QUERYResult;
  categoryKey: string | null;
}) {
  const key = categoryKey ?? "other";
  const desc = CATEGORY_DESCRIPTIONS[key] ?? "";

  if (!skills.length) {
    return (
      <p className="text-center text-sm text-white/45 font-sans">
        No skills to display.
      </p>
    );
  }

  return (
    <div>
      {desc && (
        <p className="mb-4 font-sans text-sm text-white/45 leading-relaxed text-center">
          {desc}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {skills.map((s, i) => (
          <SkillPill key={s._id} skill={s} effectIndex={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SkillsSectionClient({
  skills,
}: {
  skills: SKILLS_QUERYResult;
}) {
  const [selected, setSelected] = useState<string | null>(() =>
    getHighestCategory(skills),
  );

  const numCategories = useMemo(() => {
    return new Set(skills.map((s) => s.category ?? "other")).size;
  }, [skills]);

  const filtered = useMemo(() => {
    if (!selected) return skills;
    return skills.filter((s) => s.category === selected);
  }, [skills, selected]);

  const color = selected
    ? (CATEGORY_COLORS[normalizeCategoryKey(selected)] ?? FALLBACK_BAR)
    : FALLBACK_BAR;

  return (
    <div className="relative">
      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left: capability graph — sticky on desktop */}
        <div className="w-full md:w-[42%] md:sticky md:top-28">
          <SkillsCapabilityGraph
            skills={skills}
            selectedCategory={selected}
            onCategorySelect={(cat) => {
              if (cat !== null) setSelected(cat);
            }}
          />
        </div>

        {/* Right: filter buttons → caption → description → grid */}
        <div className="flex-1 min-w-0">
          <SkillsFilter
            skills={skills}
            selected={selected}
            onChange={setSelected}
          />
          {/* Caption — below filter, above description */}
          <p
            className="mb-2 text-center font-mono text-xs"
            style={{ color: `${color}90` }}
          >
            {skills.length} skills across {numCategories} categories
          </p>
          <ActiveCategoryView skills={filtered} categoryKey={selected} />
        </div>
      </div>
    </div>
  );
}
