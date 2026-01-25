"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 items-center rounded-md border border-white/10 bg-white/5 px-3 text-xs text-white/80 hover:bg-white/10"
      aria-label="Toggle theme"
    >
      {isDark ? "Dark" : "Light"}
    </button>
  );
}
