"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PowerPromptBlockProps {
  persona: "recruiter" | "ceo";
}

const POWER_PROMPTS: Record<"recruiter" | "ceo", string> = {
  recruiter: `[PERSONA:recruiter] I'm evaluating Anant Gupta for a software engineering role. Give me a structured breakdown: top 3 projects with outcomes, strongest technical skills with evidence of depth, and his current trajectory. Be specific and cite the record.`,
  ceo: `[PERSONA:ceo] Executive summary on Anant Gupta — where is he now, where is he heading, and what makes him a high-leverage bet? Outcomes and trajectory only, no skills list.`,
};

export function PowerPromptBlock({ persona }: PowerPromptBlockProps) {
  const [copied, setCopied] = useState(false);
  const text = POWER_PROMPTS[persona];

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
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
      <pre className="text-xs font-mono text-white/60 bg-white/[0.03] rounded-lg p-2.5 leading-relaxed whitespace-pre-wrap break-words">
        {text}
      </pre>
    </div>
  );
}
