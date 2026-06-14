"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PowerPromptBlockProps {
  persona: "recruiter" | "ceo";
  onCopied?: () => void;
}

const POWER_PROMPTS: Record<"recruiter" | "ceo", string> = {
  recruiter: `[Recruiter lens] Evaluate Anant for a new-grad role building production AI systems. Using ONLY his verified portfolio data, do exactly three things:
1) Rank his three strongest competencies for this role by EVIDENCE STRENGTH — each tied to a specific named project/experience and the one outcome or metric that proves it (no adjectives).
2) Name the single best proof in the portfolio and open that section so I can see it.
3) Close with a one-line hiring verdict.
Signal over coverage. If something isn't in the record, say so instead of inflating. Show the strongest project as a card.`,
  ceo: `[CEO lens] Brief me like I'm a founder deciding whether to bet on Anant as an early engineer. From ONLY his verified data:
- Trajectory: what is he compounding toward?
- Pattern: what class of messy problem does he reliably turn into a system? Name the projects that prove it.
- Leverage: where would he create the most value in a startup's first 90 days?
Skip implementation detail — give me direction. Take me to the project that best signals this and show it as a card.`,
};

export function PowerPromptBlock({ persona, onCopied }: PowerPromptBlockProps) {
  const [copied, setCopied] = useState(false);
  const text = POWER_PROMPTS[persona];

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={cn(
        "mx-4 mb-2 rounded-xl p-3",
        "bg-[rgba(9,10,18,0.72)] border border-[rgba(167,139,250,0.14)]",
        "backdrop-blur-[8px]",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <p className="section-kicker mb-0">{"// power prompt"}</p>
          <p className="text-xs text-white/40 font-sans">
            Hand-crafted prompt — copy, paste, and Orby locks in.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy power prompt"
          className="shrink-0 mt-0.5 text-white/40 hover:text-white/70 transition-colors"
        >
          {copied ? (
            <Check className="size-3.5 text-violet-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
