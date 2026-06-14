"use client";

import { cn } from "@/lib/utils";
import type { Persona } from "./PersonaSelector";

interface SuggestedChipsProps {
  persona: Persona;
  onSend: (text: string) => void;
}

const CHIPS: Record<Persona, string[]> = {
  friend: [
    "What's Anant actually excited about?",
    "Tell me the BOOM story",
    "Did Anant vibe code this portfolio?",
    "What tech does he geek out on?",
  ],
  recruiter: [
    "What are his top skills?",
    "Show me his strongest project",
    "Where has he had measurable impact?",
    "What's his experience timeline?",
  ],
  ceo: [
    "What's Anant's trajectory?",
    "What's his highest-impact work?",
    "Where is he headed in 5 years?",
    "What problems is he solving?",
  ],
  weirdo: [
    "Describe his stack as a sci-fi movie",
    "What's the weirdest thing he's built?",
    "Explain Kafka like he's a DJ",
    "What would his code say if it could talk?",
  ],
};

export function SuggestedChips({ persona, onSend }: SuggestedChipsProps) {
  const chips = CHIPS[persona];

  return (
    <div className="flex flex-col items-center gap-2 px-4 pb-2">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onSend(chip)}
          className={cn(
            "w-full max-w-[260px] text-center",
            "text-xs rounded-full px-2.5 py-1 transition-all duration-200",
            "bg-white/[0.03] border border-white/10",
            "text-white/50 hover:text-white/70 hover:border-white/20",
          )}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
