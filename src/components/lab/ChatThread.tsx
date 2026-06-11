"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ToolResultRenderer } from "./cards/ToolResultRenderer";

export interface ToolResult {
  toolName: string;
  result: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  toolResults?: ToolResult[];
}

interface ChatThreadProps {
  messages: ChatMessage[];
}

export function ChatThread({ messages }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <p className="text-sm text-white/30 font-sans">
          No messages yet — say hi to Orby!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
      {messages.map((msg) =>
        msg.role === "user" ? (
          <div
            key={msg.id}
            className={cn(
              "ml-auto max-w-[80%] rounded-xl px-3 py-2",
              "bg-white/[0.04] border border-violet-500/20",
              "backdrop-blur-sm",
              "text-sm text-white/85 leading-relaxed",
            )}
          >
            {msg.text}
          </div>
        ) : (
          <div key={msg.id} className="mr-auto max-w-[80%] flex flex-col gap-2">
            <div
              className={cn(
                "rounded-xl px-3 py-2",
                "bg-violet-950/40 border border-violet-500/15",
                "backdrop-blur-sm",
                "text-sm text-white/85 leading-relaxed",
              )}
            >
              {msg.text.length === 0 ? (
                <span className="animate-pulse text-white/40">...</span>
              ) : (
                msg.text
              )}
            </div>
            {msg.toolResults && msg.toolResults.length > 0 && (
              <div className="flex flex-col gap-2">
                {msg.toolResults.map((tr, idx) => (
                  <ToolResultRenderer
                    key={`${msg.id}-tool-${idx}`}
                    toolName={tr.toolName}
                    result={tr.result}
                  />
                ))}
              </div>
            )}
          </div>
        ),
      )}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
