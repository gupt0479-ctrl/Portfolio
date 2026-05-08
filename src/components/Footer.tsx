"use client";

import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative w-full px-6 py-6 bg-transparent">
      {/* Top border gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(167,139,250,0.2), transparent)",
        }}
        aria-hidden
      />

      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Left: developer glyph */}
        <span className="font-mono text-white/20 text-sm select-none">
          &lt;/&gt;
        </span>

        {/* Center: back to top button */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="float-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowUp className="size-3.5" />
          <span>Back to top</span>
        </button>

        {/* Right: copyright */}
        <span className="text-xs text-white/25 font-sans">
          © 2026 Anant Gupta · building in public
        </span>
      </div>
    </footer>
  );
}
