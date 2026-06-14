"use client";

import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="relative w-full px-6 py-4"
      style={{
        background: "rgba(9,10,18,0.55)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Top border gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(167,139,250,0.2), transparent)",
        }}
        aria-hidden
      />

      {/* 3-column grid: left / center / right — guarantees true centering */}
      <div className="grid w-full grid-cols-3 items-center">
        {/* Col 1: glyph flush left */}
        <span className="font-mono text-white/60 text-sm select-none">
          &lt;/&gt;
        </span>

        {/* Col 2: back to top — truly centered, no drift animation */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="header-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs text-white/60 hover:text-white/85 transition-colors"
          >
            <ArrowUp className="size-3.5" />
            <span>Back to top</span>
          </button>
        </div>

        {/* Col 3: copyright flush right */}
        <div className="flex justify-end">
          <span className="text-xs text-white/60 font-sans text-right">
            <span className="hidden sm:inline">building in public · </span>
            {`© ${new Date().getFullYear()} Anant Gupta`}
          </span>
        </div>
      </div>
    </footer>
  );
}
