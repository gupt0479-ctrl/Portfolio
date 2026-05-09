import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Title-case category slugs for display (e.g. soft-skills → Soft Skills). */
export function formatCategory(cat: string): string {
  return cat
    .split(/[-\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Normalize category keys for lookups (e.g. "AI ML" → "ai-ml"). */
export function normalizeCategoryKey(cat: string): string {
  return cat.trim().toLowerCase().replace(/\s+/g, "-");
}
