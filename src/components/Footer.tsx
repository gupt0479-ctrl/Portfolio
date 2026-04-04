"use client";

import { ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-white/[0.02] px-6 py-8 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 text-xs font-mono text-white/20">
          <span aria-hidden>·</span>
          <span>2025</span>
        </div>

        <p className="flex-1 text-center text-sm italic text-white/30 font-sans">
          Built in the dark. Shipped with intention.
        </p>

        <button
          type="button"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="inline-flex items-center justify-center gap-1 self-center text-xs text-white/20 transition-colors hover:text-white/50 sm:self-auto sm:justify-end"
        >
          <ArrowUp className="size-3" strokeWidth={1.75} />
          Back to top
        </button>
      </div>
    </footer>
  );
}
