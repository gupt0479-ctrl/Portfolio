"use client";

import { Send } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import type { Persona } from "./PersonaSelector";

interface ChatInputBarProps {
  onSubmit: (message: string) => void;
  onPersonaDetected?: (p: Persona) => void;
}

export function ChatInputBar({
  onSubmit,
  onPersonaDetected,
}: ChatInputBarProps) {
  const [value, setValue] = useState("");

  const trimmed = value.trim();
  const isEmpty = trimmed.length === 0;

  const handleSubmit = useCallback(() => {
    const text = value.trim();
    if (text.length === 0) return;
    onSubmit(text);
    setValue("");
  }, [value, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const match = pasted.match(/^\[PERSONA:(recruiter|friend|weirdo|ceo)\]/);
    if (match) {
      onPersonaDetected?.(match[1] as Persona);
      // Let the default paste happen, then strip the marker
      setTimeout(() => {
        setValue((prev) =>
          prev.replace(/^\[PERSONA:(recruiter|friend|weirdo|ceo)\]\s*/, ""),
        );
      }, 0);
    }
  };

  return (
    <div
      className={cn(
        "cosmic-card flex items-center gap-2 px-3 py-2",
        "border-violet-500/20",
      )}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Say something to Orby..."
        className={cn(
          "flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30",
          "outline-none border-none ring-0 focus:ring-0",
        )}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isEmpty}
        aria-label="Send message"
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          "bg-violet-500/20 text-violet-300 transition-all duration-200",
          isEmpty
            ? "opacity-40 pointer-events-none"
            : "hover:bg-violet-500/30 hover:text-violet-200 cursor-pointer",
        )}
      >
        <Send className="size-3.5" />
      </button>
    </div>
  );
}
