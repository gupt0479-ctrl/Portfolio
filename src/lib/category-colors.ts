export const CATEGORY_COLORS: Record<string, string> = {
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

const FALLBACK_COLOR = "#8f7cf7";

export function getCategoryColor(category?: string | null): string {
  return CATEGORY_COLORS[category ?? ""] ?? FALLBACK_COLOR;
}

export const SKILL_COLOR_MAP: Record<string, string> = {
  violet: "#A78BFA",
  cyan: "#67E8F9",
  emerald: "#34D399",
  sky: "#38BDF8",
  pink: "#F472B6",
  amber: "#FBBF24",
  orange: "#FB923C",
  slate: "#94A3B8",
};

export function getSkillColor(
  color?: string | null,
  category?: string | null,
): string {
  if (color && SKILL_COLOR_MAP[color]) return SKILL_COLOR_MAP[color];
  return getCategoryColor(category);
}
