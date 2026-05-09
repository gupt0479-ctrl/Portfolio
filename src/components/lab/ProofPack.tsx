"use client";
import { useState } from "react";
import type { LabMode } from "@/lib/lab-data";
import { generateProofPack } from "@/lib/lab-data";

interface ProofPackProps {
  mode: LabMode;
}

export function ProofPack({ mode }: ProofPackProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = generateProofPack(mode);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="float-btn w-full rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200/80 hover:text-violet-100 hover:bg-violet-500/15 transition-colors font-sans"
    >
      {copied ? "✓ Copied to clipboard!" : `Generate ${mode} Proof Pack`}
    </button>
  );
}
