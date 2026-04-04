"use client";

import { type CSSProperties, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIridescentEffect } from "@/lib/hooks/useIridescentEffect";
import { formatCategory, normalizeCategoryKey } from "@/lib/utils";
import type { SKILLS_QUERYResult } from "@/sanity/types";

type Skill = SKILLS_QUERYResult[number];

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "#8f7cf7",
  backend: "#60a5fa",
  "ai-ml": "#34d399",
  devops: "#f472b6",
  database: "#fb923c",
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
  cloud: "Scalable infrastructure across distributed systems.",
  mobile: "Cross-platform and native mobile experiences.",
  tools: "The developer toolchain and productivity ecosystem.",
  design: "Visual thinking, prototyping, and system aesthetics.",
  testing: "Quality assurance, coverage, and confidence.",
  "soft-skills": "Communication, leadership, and team dynamics.",
  other: "Everything else that doesn't fit a clean box.",
};

function SkillsBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ value?: unknown }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const raw = payload[0]?.value;
  const num = typeof raw === "number" ? raw : raw != null ? Number(raw) : NaN;
  const pct = Number.isFinite(num) ? Math.round(num) : 0;
  return (
    <div
      className="rounded-lg border border-white/15 bg-[#10101a] px-3 py-2 text-xs shadow-xl"
      style={{ pointerEvents: "none" }}
    >
      <p className="font-medium font-sans text-white/90">
        {formatCategory(String(label ?? ""))}
      </p>
      <p className="mt-0.5 font-sans text-white/55">Avg: {pct}%</p>
    </div>
  );
}

function SkillsChart({ skills }: { skills: SKILLS_QUERYResult }) {
  const data = useMemo(() => {
    const m = new Map<string, { sum: number; count: number }>();
    for (const s of skills) {
      const c = s.category ?? "other";
      const p = typeof s.percentage === "number" ? s.percentage : 0;
      const cur = m.get(c) ?? { sum: 0, count: 0 };
      cur.sum += p;
      cur.count += 1;
      m.set(c, cur);
    }
    return Array.from(m.entries())
      .map(([category, { sum, count }]) => ({
        category,
        avg: count ? Math.round(sum / count) : 0,
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [skills]);

  if (!data.length) {
    return null;
  }

  return (
    <div className="relative z-10 mx-auto mb-10 w-full max-w-3xl">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            horizontal
            vertical={false}
          />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="category"
            width={100}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatCategory(String(value))}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <SkillsBarTooltip
                active={active}
                label={label}
                payload={payload}
              />
            )}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            shared={false}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 50 }}
          />
          <Bar dataKey="avg" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.map((entry) => {
              const key = normalizeCategoryKey(entry.category);
              return (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[key] ?? FALLBACK_BAR}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
    <div className="mb-10 flex flex-wrap justify-center gap-2">
      {pills.map(({ key, label }) => {
        const active = key === selected;
        return (
          <button
            key={key ?? "all"}
            type="button"
            onClick={() => onChange(key)}
            className={
              active
                ? "rounded-full border border-violet-500/50 bg-violet-500/20 px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:border-white/30 hover:text-white/75"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SkillPill({ skill }: { skill: Skill }) {
  const { ref, overlayStyle } = useIridescentEffect({ gradientAlpha: 0.1 });
  const [hovered, setHovered] = useState(false);
  const label = (skill.name ?? "").toString();
  const proficiency =
    (skill.proficiency ?? "")
      .toString()
      .replace(/^\w/, (c) => c.toUpperCase()) || "";

  const style: CSSProperties = {
    transform: hovered
      ? "perspective(600px) translateY(-2px) scale(1.02)"
      : "perspective(600px)",
    transition:
      "transform 180ms ease, border-color 200ms ease, box-shadow 200ms ease",
  };

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={style}
        className={[
          "relative w-full select-none overflow-hidden rounded-full",
          "border border-white/20 bg-black/25 px-4 py-2.5",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
          hovered
            ? "border-white/40 shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_0_14px_rgba(167,139,250,0.12)]"
            : "",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        ].join(" ")}
        aria-label={label}
      >
        <span
          className="pointer-events-none absolute inset-0 z-[1] rounded-full"
          style={overlayStyle}
          aria-hidden
        />
        <div className="relative z-10 flex w-full min-w-0 items-center justify-between gap-2 text-left">
          <span className="text-sm font-medium text-white/85">{label}</span>
          {proficiency ? (
            <span className="ml-auto shrink-0 font-sans text-xs capitalize text-white/40">
              {proficiency}
            </span>
          ) : null}
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

  if (!skills.length) {
    return (
      <p className="text-center text-sm text-white/45 font-sans">
        No skills to display.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {grouped.map(([category, items]) => {
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
            <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-3 sm:max-w-none md:grid-cols-3 lg:grid-cols-4">
              {items.map((s) => (
                <SkillPill key={s._id} skill={s} />
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

  const filtered = useMemo(() => {
    if (!selected) return skills;
    return skills.filter((s) => s.category === selected);
  }, [skills, selected]);

  return (
    <div className="relative">
      <SkillsChart skills={skills} />
      <SkillsFilter
        skills={skills}
        selected={selected}
        onChange={setSelected}
      />
      <SkillsCategoryGrid skills={filtered} />
    </div>
  );
}
