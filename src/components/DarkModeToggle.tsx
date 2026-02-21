"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = useMemo(() => resolvedTheme === "dark", [resolvedTheme]);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70"
        aria-label="Toggle theme"
        disabled
      >
        <span className="h-4 w-4 rounded-sm bg-white/10" />
        <span className="hidden sm:inline">Theme</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-white/5 transition group-hover:bg-white/10">
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
