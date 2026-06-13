"use client";

// Skills are rendered as a category-grouped pill grid (SkillsCategoryGrid).
// The earlier Three.js/R3F skills "sphere" visualization was intentionally
// removed in favor of this readable 2D layout (Phase H, Option 2 — see
// .kiro/specs/sanity-render-alignment). Sanity fields percentage /
// yearsOfExperience / tone remain available in SKILLS_QUERY for a future
// graph but are intentionally unused here.

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
  // alias used by some Sanity setups
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
  // alias used by some Sanity setups
  "data-systems": "Data modeling, query optimization, and persistence.",
  cloud: "Scalable infrastructure across distributed systems.",
  mobile: "Cross-platform and native mobile experiences.",
  tools: "The developer toolchain and productivity ecosystem.",
  design: "Visual thinking, prototyping, and system aesthetics.",
  testing: "Quality assurance, coverage, and confidence.",
  "soft-skills": "Communication, leadership, and team dynamics.",
  other: "Everything else that doesn't fit a clean box.",
};

function SkillsSummary({ skills }: { skills: SKILLS_QUERYResult }) {
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const skill of skills) {
      const category = skill.category ?? "other";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [skills]);

  if (!skills.length) return null;

  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="font-sans text-sm text-white/55">
        {skills.length} skills across {categoryCounts.length} categories
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {categoryCounts.map(([category, count]) => {
          const key = normalizeCategoryKey(category);
          const color = CATEGORY_COLORS[key] ?? FALLBACK_BAR;
          return (
            <span
              key={category}
              className="orbit-chip"
              style={{ borderColor: `${color}66`, color }}
            >
              {formatCategory(category)} {count}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  categoryKey,
  onClick,
}: {
  label: string;
  active: boolean;
  categoryKey: string | null;
  onClick: () => void;
}) {
  const { ref, style } = useSpaceFloat({ radius: 3, rotate: 0.2, speed: 0.6 });
  const [hovered, setHovered] = useState(false);
  const normalizedKey = categoryKey ? normalizeCategoryKey(categoryKey) : null;

  return (
    <div ref={ref as RefObject<HTMLDivElement>} style={style}>
      <CometCard variant="ghost" rotateDepth={10} translateDepth={12}>
        <button
          type="button"
          onClick={onClick}
          aria-pressed={active}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={[
            "group relative overflow-hidden rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
            active
              ? "border-violet-500/50 bg-violet-500/20 text-white"
              : "border-white/20 text-white/50 hover:border-white/30 hover:text-white/75",
            normalizedKey === "ai-ml" && hovered
              ? "animate-[pulse-glow_1s_ease-in-out_infinite]"
              : "",
            normalizedKey === "soft-skills" && hovered
              ? "translate-y-[-2px]"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            normalizedKey === "frontend" && hovered
              ? { boxShadow: "0 0 0 1px rgba(143,124,247,0.4)" }
              : undefined
          }
        >
          {normalizedKey === "frontend" && (
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          )}
          <span className="relative">
            {label}
            {normalizedKey === "backend" && hovered && (
              <span className="ml-1 animate-[blink_1s_step-end_infinite] text-white/50">
                _
              </span>
            )}
          </span>
          {(normalizedKey === "devops" || normalizedKey === "tools") &&
            hovered && (
              <span className="ml-1.5 inline-flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block w-1 h-1 rounded-full bg-pink-400/60 animate-[deploy-dot_0.6s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </span>
            )}
          {(normalizedKey === "database" || normalizedKey === "data-systems") &&
            hovered && (
              <span className="ml-1.5 inline-flex items-end gap-px">
                {[
                  { id: "low", height: 3 },
                  { id: "high", height: 5 },
                  { id: "mid", height: 4 },
                  { id: "peak", height: 6 },
                  { id: "tail", height: 3 },
                ].map((bar, i) => (
                  <span
                    key={bar.id}
                    className="inline-block w-0.5 rounded-sm bg-orange-400/70 animate-[pulse-glow_0.8s_ease-in-out_infinite]"
                    style={{
                      height: `${bar.height}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </span>
            )}
        </button>
      </CometCard>
    </div>
  );
}

function SkillsFilter({
  skills,
  selected,
  onChange,
}: {
  skills: SKILLS_QUERYResult;
  selected: string | null;
  onChange: (category: string | null) => void;
}) {
  const categories = Array.from(
    new Set(
      skills
        .map((s) => s.category)
        .filter((c): c is NonNullable<typeof c> => c != null),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const pills: { key: string | null; label: string }[] = [
    { key: null, label: "All" },
    ...categories.map((c) => ({ key: c, label: formatCategory(c) })),
  ];

  return (
    <div className="mb-6 flex flex-wrap justify-center gap-2">
      {pills.map(({ key, label }) => (
        <CategoryPill
          key={key ?? "all"}
          label={label}
          active={key === selected}
          categoryKey={key}
          onClick={() => onChange(key)}
        />
      ))}
    </div>
  );
}

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
    transform:
      hovered && effect === 6
        ? "perspective(400px) rotateY(6deg) translateY(-2px)"
        : hovered
          ? "perspective(600px) translateY(-2px) scale(1.02)"
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
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={effectStyle}
        className={[
          "relative w-full select-none overflow-hidden rounded-full",
          "border border-white/20 bg-black/25 px-3 py-1.5",
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

        {/* Effect 3: constellation dots */}
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

        {/* Effect 5: orbit dot */}
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

        <div className="relative z-10 flex w-full min-w-0 items-center justify-between gap-2 text-left">
          <span className="text-sm font-medium text-white/85">{label}</span>
          {/* Proficiency on hover only */}
          {hovered && proficiency && (
            <span className="ml-auto shrink-0 font-sans text-xs capitalize text-white/40">
              {proficiency}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

function SkillsCategoryGrid({ skills }: { skills: SKILLS_QUERYResult }) {
  const grouped = useMemo(() => {
    const m = new Map<string, SKILLS_QUERYResult>();
    for (const s of skills) {
      const c = s.category ?? "other";
      if (!m.has(c)) m.set(c, []);
      m.get(c)?.push(s);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [skills]);

  // Build flat array of [category, items, baseIndex] to avoid mutable counter.
  // Must stay above the early return so hooks are always called in the same order.
  const groupedWithIndex = useMemo(() => {
    let counter = 0;
    return grouped.map(([category, items]) => {
      const baseIndex = counter;
      counter += items.length;
      return { category, items, baseIndex } as {
        category: string;
        items: SKILLS_QUERYResult;
        baseIndex: number;
      };
    });
  }, [grouped]);

  if (!skills.length) {
    return (
      <p className="text-center text-sm text-white/45 font-sans">
        No skills to display.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {groupedWithIndex.map(({ category, items, baseIndex }) => {
        const desc =
          CATEGORY_DESCRIPTIONS[category] ?? CATEGORY_DESCRIPTIONS.other ?? "";
        return (
          <section key={category} className="text-center">
            <h3 className="font-display text-sm font-semibold tracking-wide text-white/75">
              {formatCategory(category)}
            </h3>
            {desc ? (
              <p className="mt-1 font-sans text-sm text-white/45">{desc}</p>
            ) : null}
            <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-2 sm:max-w-none md:grid-cols-3 lg:grid-cols-4">
              {items.map((s, localIdx) => (
                <SkillPill
                  key={s._id}
                  skill={s}
                  effectIndex={baseIndex + localIdx}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function SkillsSectionClient({
  skills,
}: {
  skills: SKILLS_QUERYResult;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [graphCategory, setGraphCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selected) return skills;
    return skills.filter((s) => s.category === selected);
  }, [skills, selected]);

  const handleCategoryChange = (category: string | null) => {
    setSelected(category);
    setGraphCategory(category);
  };

  return (
    <div className="relative">
      <SkillsSummary skills={skills} />
      <div className="mt-8 flex flex-col md:flex-row gap-10 items-start">
        {/* Left: capability graph — sticky on desktop */}
        <div className="w-full md:w-[42%] md:sticky md:top-28">
          <SkillsCapabilityGraph
            skills={skills}
            selectedCategory={graphCategory}
            onCategorySelect={(cat) => {
              setGraphCategory(cat);
              setSelected(cat);
            }}
          />
        </div>
        {/* Right: filter pills + skill grid */}
        <div className="flex-1 min-w-0">
          <SkillsFilter
            skills={skills}
            selected={selected}
            onChange={handleCategoryChange}
          />
          <SkillsCategoryGrid skills={filtered} />
        </div>
      </div>
    </div>
  );
}
