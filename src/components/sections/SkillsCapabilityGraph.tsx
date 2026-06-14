"use client";

import { motion, useAnimation } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatCategory } from "@/lib/utils";
import type { SKILLS_QUERYResult } from "@/sanity/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const YEARS = ["2021", "2022", "2023", "2024", "2025", "2026"];

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

// SVG layout constants — plot area: (60, 20) → (540, 280) = 480 × 260
const PAD_LEFT = 60;
const PAD_TOP = 20;
const PAD_BOTTOM = 40;
const PAD_RIGHT = 20;
const VIEW_W = 560;
const VIEW_H = 320;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT; // 480
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM; // 260

// ─── Math helpers ─────────────────────────────────────────────────────────────

// ─── Pattern-based trajectory system ─────────────────────────────────────────
//
// Each category has a hand-crafted 6-point pattern (one value per year, 2021–2026).
// pattern[5] = 1.0 so the 2026 endpoint always equals the category's real avg.
// startFloor is the absolute Y the line starts from when pattern = 0.
//
// Narrative key:
//   ai-ml       — hockey stick: near-zero start, explosive recent growth
//   frontend    — early adopter: solid start, rapid rise, gentle plateau
//   backend     — reliable: moderate start, consistent climb all years
//   devops      — late starter: slow early, clear acceleration 2023→2026
//   database    — foundational: decent start, methodical steady rise
//   cloud       — recent pivot: very low start, fast ramp 2024→2026
//   mobile      — explored: strong climb, secondary focus later (plateau)
//   tools       — utility belt: high start, mastered early
//   design      — gradual: low start, slow but consistent exploration
//   testing     — late adopter: almost zero start, sharp recent acceleration
//   soft-skills — always improving: near-linear upward slope, never flat
//   academic    — school-driven: peaks near programme start, slight taper
//
interface CategoryShape {
  pattern: [number, number, number, number, number, number];
  startFloor: number;
}

const CATEGORY_SHAPES: Record<string, CategoryShape> = {
  frontend: { pattern: [0.32, 0.52, 0.68, 0.81, 0.92, 1.0], startFloor: 18 },
  backend: { pattern: [0.2, 0.37, 0.54, 0.69, 0.84, 1.0], startFloor: 12 },
  "ai-ml": { pattern: [0.04, 0.08, 0.16, 0.38, 0.72, 1.0], startFloor: 2 },
  devops: { pattern: [0.08, 0.14, 0.24, 0.42, 0.68, 1.0], startFloor: 5 },
  database: { pattern: [0.24, 0.42, 0.58, 0.72, 0.86, 1.0], startFloor: 10 },
  "data-systems": {
    pattern: [0.24, 0.42, 0.58, 0.72, 0.86, 1.0],
    startFloor: 10,
  },
  cloud: { pattern: [0.05, 0.1, 0.22, 0.44, 0.7, 1.0], startFloor: 3 },
  mobile: { pattern: [0.28, 0.5, 0.7, 0.85, 0.95, 1.0], startFloor: 8 },
  tools: { pattern: [0.44, 0.6, 0.73, 0.84, 0.92, 1.0], startFloor: 20 },
  design: { pattern: [0.14, 0.28, 0.44, 0.62, 0.8, 1.0], startFloor: 5 },
  testing: { pattern: [0.03, 0.07, 0.14, 0.3, 0.6, 1.0], startFloor: 1 },
  "soft-skills": {
    pattern: [0.38, 0.48, 0.58, 0.7, 0.83, 1.0],
    startFloor: 15,
  },
  other: { pattern: [0.18, 0.34, 0.5, 0.66, 0.82, 1.0], startFloor: 5 },
  academic: { pattern: [0.42, 0.66, 0.82, 0.96, 1.0, 0.96], startFloor: 12 },
};

/**
 * Returns 6 Y-values (2021–2026) for a category.
 * Each point = startFloor + pattern[i] × (avg − startFloor).
 * The 2026 endpoint equals the category's real avg depth; all prior
 * years follow the category's unique narrative shape.
 */
function buildCurveValues(avg: number, categoryKey: string): number[] {
  const shape = CATEGORY_SHAPES[categoryKey] ??
    CATEGORY_SHAPES.other ?? {
      pattern: [0.1, 0.25, 0.45, 0.62, 0.82, 1.0] as [
        number,
        number,
        number,
        number,
        number,
        number,
      ],
      startFloor: 5,
    };
  return shape.pattern.map((p) =>
    Math.min(100, Math.max(0, shape.startFloor + p * (avg - shape.startFloor))),
  );
}

/** Map a 0-100 Y value to an SVG Y coordinate (inverted — 0 is top in SVG). */
function yToSvg(value: number): number {
  return PAD_TOP + PLOT_H - (value / 100) * PLOT_H;
}

/** Map a year index (0–5) to an SVG X coordinate. */
function xToSvg(index: number): number {
  return PAD_LEFT + (index / (YEARS.length - 1)) * PLOT_W;
}

/** Build a smooth SVG cubic-bezier path string from an array of [x, y] pairs. */
function buildSmoothPath(points: [number, number][]): string {
  if (points.length < 2) return "";

  const d: string[] = [`M ${points[0][0]},${points[0][1]}`];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Control points: 1/3 of the way from each anchor
    const cpX = (curr[0] - prev[0]) / 3;
    const cp1x = prev[0] + cpX;
    const cp2x = curr[0] - cpX;
    d.push(`C ${cp1x},${prev[1]} ${cp2x},${curr[1]} ${curr[0]},${curr[1]}`);
  }

  return d.join(" ");
}

/** Build a closed area path: line path + bottom edge return. */
function buildAreaPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  const line = buildSmoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last[0]},${PAD_TOP + PLOT_H} L ${first[0]},${PAD_TOP + PLOT_H} Z`;
}

// ─── Direction phrase helper ──────────────────────────────────────────────────

function directionPhrase(avg: number): string {
  if (avg >= 75) return "stabilizing";
  if (avg >= 55) return "climbing";
  return "ascending";
}

// ─── Category data builder ────────────────────────────────────────────────────

interface CategoryData {
  key: string;
  label: string;
  color: string;
  avg: number;
  skillCount: number;
  curveValues: number[];
  points: [number, number][];
  linePath: string;
  areaPath: string;
  endpointX: number;
  endpointY: number;
}

function buildCategoryData(skills: SKILLS_QUERYResult): CategoryData[] {
  // Group skills by category
  const grouped = new Map<string, number[]>();
  for (const skill of skills) {
    const cat = skill.category ?? "other";
    const pct = skill.percentage ?? 50;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)?.push(pct);
  }

  return Array.from(grouped.entries())
    .map(([key, percentages]) => {
      const avg = percentages.reduce((s, p) => s + p, 0) / percentages.length;
      const curveValues = buildCurveValues(avg, key);
      const points: [number, number][] = curveValues.map((v, i) => [
        xToSvg(i),
        yToSvg(v),
      ]);
      const endpointX = points[points.length - 1][0];
      const endpointY = points[points.length - 1][1];

      return {
        key,
        label: formatCategory(key),
        color: CATEGORY_COLORS[key] ?? CATEGORY_COLORS.other ?? "#cbd5e1",
        avg,
        skillCount: percentages.length,
        curveValues,
        points,
        linePath: buildSmoothPath(points),
        areaPath: buildAreaPath(points),
        endpointX,
        endpointY,
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

// ─── Animated path subcomponent ───────────────────────────────────────────────

interface AnimatedLineProps {
  data: CategoryData;
  isHovered: boolean;
  anyHovered: boolean;
  prefersReduced: boolean;
  animDelay: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  gradientId: string;
}

function AnimatedLine({
  data,
  isHovered,
  anyHovered,
  prefersReduced,
  animDelay,
  onMouseEnter,
  onMouseLeave,
  gradientId,
}: AnimatedLineProps) {
  const controls = useAnimation();
  // Track whether the mount animation has already been kicked off so subsequent
  // re-renders (e.g. hover state changes) don't restart the path-draw.
  const mountedRef = useRef(false);

  useEffect(() => {
    if (prefersReduced) return;
    if (!mountedRef.current) {
      // First render: drive the path-draw animation once with staggered delay.
      mountedRef.current = true;
      controls.set({ pathLength: 0, opacity: 0 });
      controls.start({
        pathLength: 1,
        opacity: isHovered || !anyHovered ? 1 : 0.2,
        transition: {
          pathLength: { duration: 1.4, delay: animDelay, ease: "easeInOut" },
          opacity: { duration: 0.3, delay: animDelay },
        },
      });
    } else {
      // Subsequent renders: only update opacity in response to hover changes.
      controls.start({
        opacity: isHovered || !anyHovered ? 1 : 0.2,
        transition: { duration: 0.2 },
      });
    }
  }, [controls, prefersReduced, animDelay, isHovered, anyHovered]);

  const baseOpacity = prefersReduced ? 1 : undefined;
  const strokeWidth = isHovered ? 2.5 : 2;
  const dotRadius = isHovered ? 5 : 3.5;

  return (
    // biome-ignore lint/a11y/useSemanticElements: <g> is inside SVG — <button> is not a valid SVG child
    <g
      role="button"
      tabIndex={0}
      aria-label={`${data.label} trajectory line`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onMouseEnter();
      }}
      style={{ cursor: "crosshair" }}
    >
      {/* Area fill — very subtle gradient under the line */}
      <path
        d={data.areaPath}
        fill={`url(#${gradientId})`}
        opacity={isHovered ? 0.18 : anyHovered ? 0.03 : 0.08}
        style={{ transition: "opacity 200ms ease" }}
        pointerEvents="stroke"
        strokeWidth={12}
        stroke="transparent"
      />

      {/* Animated stroke */}
      <motion.path
        d={data.linePath}
        fill="none"
        stroke={data.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={
          prefersReduced
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        animate={prefersReduced ? { pathLength: 1, opacity: 1 } : controls}
        style={{
          opacity: baseOpacity,
          filter: isHovered
            ? `drop-shadow(0 0 6px ${data.color}88)`
            : undefined,
          transition: "stroke-width 150ms ease, filter 150ms ease",
        }}
        pointerEvents="stroke"
      />

      {/* Invisible wider hit area so hover is easy to trigger */}
      <path
        d={data.linePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        pointerEvents="stroke"
      />

      {/* Endpoint dot */}
      <circle
        cx={data.endpointX}
        cy={data.endpointY}
        r={dotRadius}
        fill={data.color}
        opacity={anyHovered && !isHovered ? 0.2 : 1}
        style={{
          filter: `drop-shadow(0 0 ${isHovered ? 8 : 4}px ${data.color})`,
          transition: "opacity 200ms ease, r 150ms ease, filter 150ms ease",
        }}
      />
    </g>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipProps {
  data: CategoryData;
}

function Tooltip({ data }: TooltipProps) {
  // Clamp tooltip so it stays inside the viewBox
  const rawX = data.endpointX + 10;
  const tooltipW = 130;
  const clampedX = Math.min(rawX, VIEW_W - tooltipW - PAD_RIGHT);
  const clampedY = Math.max(PAD_TOP, data.endpointY - 36);

  return (
    <g style={{ pointerEvents: "none" }}>
      <rect
        x={clampedX}
        y={clampedY}
        width={tooltipW}
        height={52}
        rx={6}
        fill="rgba(9,10,18,0.92)"
        stroke={data.color}
        strokeWidth={0.75}
        strokeOpacity={0.6}
      />
      {/* Category name */}
      <text
        x={clampedX + 8}
        y={clampedY + 16}
        fill={data.color}
        fontSize={11}
        fontFamily="monospace"
        fontWeight={600}
      >
        {data.label}
      </text>
      {/* Avg depth */}
      <text
        x={clampedX + 8}
        y={clampedY + 31}
        fill="rgba(255,255,255,0.7)"
        fontSize={10}
        fontFamily="monospace"
      >
        {Math.round(data.avg)}% depth
      </text>
      {/* Direction phrase */}
      <text
        x={clampedX + 8}
        y={clampedY + 45}
        fill="rgba(255,255,255,0.45)"
        fontSize={9}
        fontFamily="monospace"
        fontStyle="italic"
      >
        {directionPhrase(data.avg)}
      </text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SkillsCapabilityGraphProps {
  skills: SKILLS_QUERYResult;
  selectedCategory: string | null;
  onCategorySelect: (cat: string | null) => void;
}

export function SkillsCapabilityGraph({
  skills,
  selectedCategory,
  onCategorySelect,
}: SkillsCapabilityGraphProps) {
  const prefersReduced = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  ).current;

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Sync internal hover state with external selectedCategory prop
  const activeCategory = hoveredCategory ?? selectedCategory;

  const categoryData = useMemo(() => buildCategoryData(skills), [skills]);
  const anyHovered = activeCategory !== null;

  const handleEnter = (key: string) => {
    setHoveredCategory(key);
    onCategorySelect(key);
  };

  const handleLeave = () => {
    setHoveredCategory(null);
    onCategorySelect(null);
  };

  const hoveredData =
    categoryData.find((d) => d.key === activeCategory) ?? null;

  // Y-axis grid values
  const yGridValues = [0, 25, 50, 75, 100];

  return (
    <div className="relative w-full">
      {/* SVG graph */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          background: "rgba(9,10,18,0.78)",
          border: "1px solid rgba(167,139,250,0.22)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow:
            "0 0 0 1px rgba(167,139,250,0.08) inset, 0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Y-axis label — rotated text */}
        <div
          className="pointer-events-none absolute left-0 top-0 flex items-center justify-center"
          style={{ width: PAD_LEFT, height: VIEW_H, zIndex: 1 }}
        >
          <span
            className="text-center font-mono"
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.3)",
              transform: "rotate(-90deg)",
              whiteSpace: "nowrap",
              letterSpacing: "0.05em",
            }}
          >
            Familiarity / Applied Depth
          </span>
        </div>

        <svg
          width="100%"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          aria-label="Skills capability graph showing learning trajectory per category"
          role="img"
          style={{ display: "block" }}
        >
          <defs>
            {/* Per-category gradient fills */}
            {categoryData.map((d) => (
              <linearGradient
                key={d.key}
                id={`grad-${d.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={d.color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={d.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {/* ── Y-axis grid lines and labels ── */}
          {yGridValues.map((val) => {
            const yPos = yToSvg(val);
            return (
              <g key={val}>
                <line
                  x1={PAD_LEFT}
                  y1={yPos}
                  x2={VIEW_W - PAD_RIGHT}
                  y2={yPos}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={1}
                  strokeDasharray={val === 0 ? undefined : "3,4"}
                />
                <text
                  x={PAD_LEFT - 6}
                  y={yPos + 4}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.3)"
                  fontSize={10}
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* ── X-axis line ── */}
          <line
            x1={PAD_LEFT}
            y1={PAD_TOP + PLOT_H}
            x2={VIEW_W - PAD_RIGHT}
            y2={PAD_TOP + PLOT_H}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />

          {/* ── Y-axis line ── */}
          <line
            x1={PAD_LEFT}
            y1={PAD_TOP}
            x2={PAD_LEFT}
            y2={PAD_TOP + PLOT_H}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />

          {/* ── X-axis labels (years) ── */}
          {YEARS.map((year, i) => (
            <text
              key={year}
              x={xToSvg(i)}
              y={VIEW_H - 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.35)"
              fontSize={11}
              fontFamily="monospace"
            >
              {year}
            </text>
          ))}

          {/* ── X-axis vertical tick lines ── */}
          {YEARS.map((year, i) => (
            <line
              key={`tick-${year}`}
              x1={xToSvg(i)}
              y1={PAD_TOP + PLOT_H}
              x2={xToSvg(i)}
              y2={PAD_TOP + PLOT_H + 4}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />
          ))}

          {/* ── Category lines ── */}
          {categoryData.map((d, i) => (
            <AnimatedLine
              key={d.key}
              data={d}
              isHovered={activeCategory === d.key}
              anyHovered={anyHovered}
              prefersReduced={prefersReduced}
              animDelay={i * 0.12}
              onMouseEnter={() => handleEnter(d.key)}
              onMouseLeave={handleLeave}
              gradientId={`grad-${d.key}`}
            />
          ))}

          {/* ── Tooltip for hovered line ── */}
          {hoveredData !== null && <Tooltip data={hoveredData} />}
        </svg>
      </div>

      {/* ── Insight panel ── */}
      <div
        className="mt-3 rounded-xl px-4 py-3 font-mono text-sm"
        style={{
          background: "rgba(14,16,28,0.82)",
          border: "1px solid rgba(167,139,250,0.14)",
          minHeight: 44,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "border-color 200ms ease",
          borderColor: hoveredData
            ? `${hoveredData.color}44`
            : "rgba(167,139,250,0.14)",
        }}
      >
        {hoveredData !== null ? (
          <span style={{ color: hoveredData.color }}>
            <span style={{ fontWeight: 600 }}>{hoveredData.label}</span>
            <span className="text-white/40"> · </span>
            <span className="text-white/60">
              {directionPhrase(hoveredData.avg)}
            </span>
            <span className="text-white/40"> · </span>
            <span className="text-white/60">
              {hoveredData.skillCount} skill
              {hoveredData.skillCount !== 1 ? "s" : ""}
            </span>
            <span className="text-white/40"> · </span>
            <span className="text-white/60">
              {Math.round(hoveredData.avg)}% avg depth
            </span>
          </span>
        ) : (
          <span className="text-white/35 italic">
            Hover a line to explore trajectory.
          </span>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 px-1">
        {categoryData.map((d) => (
          <button
            key={d.key}
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{
              borderColor:
                activeCategory === d.key
                  ? `${d.color}66`
                  : "rgba(255,255,255,0.1)",
              color:
                activeCategory === d.key ? d.color : "rgba(255,255,255,0.45)",
              background:
                activeCategory === d.key ? `${d.color}14` : "transparent",
            }}
            onMouseEnter={() => handleEnter(d.key)}
            onMouseLeave={handleLeave}
            aria-label={`View ${d.label} trajectory`}
          >
            {/* Colored swatch */}
            <span
              className="inline-block rounded-full"
              style={{
                width: 7,
                height: 7,
                background: d.color,
                boxShadow: `0 0 4px ${d.color}`,
                flexShrink: 0,
              }}
              aria-hidden
            />
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
