"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { LAB_CHIPS, LAB_RESPONSES } from "@/lib/lab-data";
import type { LabMode, LabResponse } from "@/lib/lab-data";
import { EvidenceCard } from "./EvidenceCard";
import { ProofPack } from "./ProofPack";

const MODES: LabMode[] = ["Recruiter", "Builder", "Research", "Skeptic"];

const MODE_DESCRIPTIONS: Record<LabMode, string> = {
  Recruiter: "Hiring signal",
  Builder: "Technical depth",
  Research: "Academic lens",
  Skeptic: "Show me proof",
};

export function PortfolioLab() {
  const [activeMode, setActiveMode] = useState<LabMode>("Recruiter");
  const [activeResponse, setActiveResponse] = useState<LabResponse | null>(
    null,
  );
  const { toggleSidebar } = useSidebar();

  const chips = LAB_CHIPS[activeMode];

  const handleChipClick = (responseKey: string) => {
    const response = LAB_RESPONSES[responseKey];
    if (response) setActiveResponse(response);
  };

  const handleModeChange = (mode: LabMode) => {
    setActiveMode(mode);
    setActiveResponse(null);
  };

  // Escape key closes the lab panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleSidebar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with close button */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div>
          <p className="section-kicker mb-0.5">// portfolio lab</p>
          <p className="text-xs text-white/40 font-sans">
            Explore the portfolio through different lenses.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Close Portfolio Lab"
          className="float-btn flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40 hover:text-white/80 transition-colors shrink-0"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Mode selector */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="grid grid-cols-2 gap-1.5">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              className={[
                "float-btn rounded-lg px-3 py-2 text-left transition-colors",
                activeMode === mode
                  ? "bg-violet-500/20 border border-violet-500/40 text-white"
                  : "border border-white/10 text-white/50 hover:text-white/75 hover:border-white/20",
              ].join(" ")}
            >
              <p className="text-xs font-medium">{mode}</p>
              <p className="text-[10px] text-white/35 mt-0.5">
                {MODE_DESCRIPTIONS[mode]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chips */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-[10px] text-white/30 font-mono mb-2">// ask</p>
        <div className="flex flex-col gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleChipClick(chip.responseKey)}
              className="float-btn text-left rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60 hover:text-white/85 hover:border-white/20 transition-colors font-sans"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Response area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {activeResponse ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-display font-semibold text-white">
                {activeResponse.heading}
              </h3>
              <p className="mt-1 text-xs text-white/55 font-sans leading-relaxed">
                {activeResponse.summary}
              </p>
            </div>
            <div className="space-y-2">
              {activeResponse.evidence.map((item, i) => (
                <EvidenceCard key={i} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-xs text-white/25 font-mono">
              // select a question above
            </p>
          </div>
        )}
      </div>

      {/* Proof pack (Recruiter mode only) */}
      {activeMode === "Recruiter" && (
        <div className="px-4 pb-4 pt-2 border-t border-white/[0.06]">
          <ProofPack mode={activeMode} />
        </div>
      )}
    </div>
  );
}
