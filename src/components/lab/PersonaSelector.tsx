"use client";

import { cn } from "@/lib/utils";

type Persona = "recruiter" | "friend" | "weirdo" | "ceo";

interface PersonaSelectorProps {
  active: Persona;
  onChange: (p: Persona) => void;
}

const PERSONA_CONFIG = [
  { id: "friend" as Persona, label: "Friend", icon: "👋" },
  { id: "recruiter" as Persona, label: "Recruiter", icon: "💼" },
  { id: "ceo" as Persona, label: "CEO", icon: "⬆" },
  { id: "weirdo" as Persona, label: "Weirdo", icon: "🛸" },
] as const;

export function PersonaSelector({ active, onChange }: PersonaSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 flex-wrap">
      {PERSONA_CONFIG.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-1 text-xs rounded-full px-2.5 py-1 transition-all duration-200 border",
            active === id
              ? "border-violet-400/60 bg-violet-500/10 text-violet-300 shadow-[0_0_8px_rgba(139,92,246,0.2)]"
              : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/20 hover:text-white/70",
          )}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export type { Persona };
